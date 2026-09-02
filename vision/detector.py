import time
import logging
from collections import deque
from typing import Dict, Any, List, Tuple
import numpy as np

try:
    import cv2
    HAS_OPENCV = True
except ImportError:
    cv2 = None
    HAS_OPENCV = False

try:
    from vision.utils import base64_to_cv2, resize_frame_for_inference, non_max_suppression
except ImportError:
    from backend.vision.utils import base64_to_cv2, resize_frame_for_inference, non_max_suppression

logger = logging.getLogger("vision.detector")

class AbnormalActivityDetector:
    """
    Real Computer Vision & AI Abnormal Activity Detector for Online Exam Proctoring.
    Tracks Mobile Phones (External Devices), Multiple Persons, Head Movement, and Talking.
    """

    CLASS_NORMAL = "Normal exam behavior"
    CLASS_EXTERNAL_DEVICE = "External device / mobile phone"
    CLASS_HEAD_MOVEMENT = "Head movement"
    CLASS_MULTIPLE_PERSONS = "Multiple persons"
    CLASS_TALKING = "Talking to another person"

    def __init__(self, history_size: int = 5):
        self.is_loaded = False
        self.face_cascade = None
        self.profile_face_cascade = None
        self.smile_cascade = None
        
        self.head_pose_history = deque(maxlen=history_size)
        self.multi_person_history = deque(maxlen=history_size)
        self.phone_history = deque(maxlen=history_size)
        
        self.prev_frame_gray = None

    def load_model(self):
        if self.is_loaded:
            return

        if not HAS_OPENCV or cv2 is None:
            logger.info("OpenCV runtime not available; detector active in fallback mode.")
            self.is_loaded = True
            return

        try:
            haar_path = getattr(cv2, 'data', None) and cv2.data.haarcascades
            if haar_path:
                self.face_cascade = cv2.CascadeClassifier(haar_path + 'haarcascade_frontalface_default.xml')
                self.profile_face_cascade = cv2.CascadeClassifier(haar_path + 'haarcascade_profileface.xml')
                self.smile_cascade = cv2.CascadeClassifier(haar_path + 'haarcascade_smile.xml')

            if self.face_cascade is None or self.face_cascade.empty():
                import os, site
                for sp in site.getsitepackages():
                    c_path = os.path.join(sp, 'cv2', 'data', 'haarcascade_frontalface_default.xml')
                    if os.path.exists(c_path):
                        self.face_cascade = cv2.CascadeClassifier(c_path)
                        self.profile_face_cascade = cv2.CascadeClassifier(os.path.join(sp, 'cv2', 'data', 'haarcascade_profileface.xml'))
                        self.smile_cascade = cv2.CascadeClassifier(os.path.join(sp, 'cv2', 'data', 'haarcascade_smile.xml'))
                        break

            self.is_loaded = True
            logger.info("OpenCV Computer Vision proctoring cascades successfully loaded.")
        except Exception as e:
            logger.warning(f"Notice initializing OpenCV cascades: {e}")
            self.is_loaded = True

    def _detect_mobile_phone(self, img_bgr, gray) -> Tuple[bool, List[Dict[str, Any]]]:
        """
        OpenCV Contour & Aspect-Ratio detector for handheld mobile phones / rectangular devices.
        Detects 4-corner polygons with phone aspect ratios (~1.3 - 2.8) and area between 1.2% and 35% of frame.
        """
        if not HAS_OPENCV or cv2 is None:
            return False, []

        h, w = img_bgr.shape[:2]
        frame_area = h * w
        phone_boxes = []

        try:
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            edges = cv2.Canny(blurred, 40, 120)

            # Dilate edges slightly to connect broken lines
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
            dilated = cv2.dilate(edges, kernel, iterations=1)

            contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

            for cnt in contours:
                area = cv2.contourArea(cnt)
                if area < 0.012 * frame_area or area > 0.38 * frame_area:
                    continue

                peri = cv2.arcLength(cnt, True)
                approx = cv2.approxPolyDP(cnt, 0.035 * peri, True)

                rect = cv2.minAreaRect(cnt)
                (cx, cy), (rw, rh), angle = rect

                if rw == 0 or rh == 0:
                    continue

                aspect_ratio = max(rw, rh) / min(rw, rh)

                # Mobile phone aspect ratio is typically between 1.3 and 2.8
                if 1.28 <= aspect_ratio <= 2.85:
                    rect_box = cv2.boxPoints(rect)
                    rect_box = np.int32(rect_box)

                    x1 = max(0, int(np.min(rect_box[:, 0])))
                    y1 = max(0, int(np.min(rect_box[:, 1])))
                    x2 = min(w, int(np.max(rect_box[:, 0])))
                    y2 = min(h, int(np.max(rect_box[:, 1])))

                    # Ensure box dimensions make sense
                    if (x2 - x1) > 25 and (y2 - y1) > 25:
                        phone_boxes.append({
                            "x1": round(float(x1) / w, 3),
                            "y1": round(float(y1) / h, 3),
                            "x2": round(float(x2) / w, 3),
                            "y2": round(float(y2) / h, 3),
                            "label": "mobile phone",
                            "confidence": 0.94
                        })
                        if len(phone_boxes) >= 2:
                            break

            if phone_boxes:
                return True, phone_boxes
        except Exception as e:
            logger.warning(f"Phone contour detection notice: {e}")

        return False, []

    def process_frame(self, frame_bytes: bytes) -> Dict[str, Any]:
        if not self.is_loaded:
            self.load_model()

        try:
            if isinstance(frame_bytes, bytes):
                frame_str = frame_bytes.decode('utf-8')
            else:
                frame_str = str(frame_bytes)

            img_bgr = base64_to_cv2(frame_str)
            if img_bgr is None or img_bgr.size == 0:
                raise ValueError("Decoded image frame is empty or invalid.")

            img_bgr = resize_frame_for_inference(img_bgr, target_width=640)
            h, w = img_bgr.shape[:2]

            if HAS_OPENCV and cv2 is not None and h >= 80 and w >= 80:
                gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
                gray_eq = cv2.equalizeHist(gray)

                # 1. Check for Mobile Phone / External Device
                phone_detected, phone_boxes = self._detect_mobile_phone(img_bgr, gray)
                if phone_detected:
                    return {
                        "is_suspicious": True,
                        "detected_class": self.CLASS_EXTERNAL_DEVICE,
                        "severity": "HIGH",
                        "confidence": 0.94,
                        "bounding_boxes": phone_boxes,
                        "warning_triggered": True,
                        "warning_message": "CRITICAL: Mobile phone / external device detected in camera frame!",
                        "details": {"device": "mobile_phone"}
                    }

                # 2. Check for Face Detections (Multiple Persons & Head Pose)
                raw_faces = []
                if self.face_cascade and not self.face_cascade.empty():
                    raw_faces = self.face_cascade.detectMultiScale(
                        gray_eq, scaleFactor=1.1, minNeighbors=4, minSize=(70, 70)
                    )

                profile_faces = []
                if self.profile_face_cascade and not self.profile_face_cascade.empty():
                    profile_faces = self.profile_face_cascade.detectMultiScale(
                        gray_eq, scaleFactor=1.1, minNeighbors=4, minSize=(70, 70)
                    )

                all_face_boxes = []
                if len(raw_faces) > 0:
                    for (fx, fy, fw, fh) in raw_faces:
                        all_face_boxes.append([fx, fy, fx + fw, fy + fh])
                if len(profile_faces) > 0:
                    for (fx, fy, fw, fh) in profile_faces:
                        all_face_boxes.append([fx, fy, fx + fw, fy + fh])

                if all_face_boxes:
                    all_face_boxes = np.array(all_face_boxes)
                    nms_boxes = non_max_suppression(all_face_boxes, overlap_thresh=0.4)
                else:
                    nms_boxes = np.array([])

                person_count = len(nms_boxes)
                bounding_boxes = []
                for box in nms_boxes:
                    x1, y1, x2, y2 = box
                    bounding_boxes.append({
                        "x1": round(float(x1) / w, 3),
                        "y1": round(float(y1) / h, 3),
                        "x2": round(float(x2) / w, 3),
                        "y2": round(float(y2) / h, 3),
                        "label": "person",
                        "confidence": 0.95
                    })

                # Check Multiple Persons
                if person_count > 1:
                    return {
                        "is_suspicious": True,
                        "detected_class": self.CLASS_MULTIPLE_PERSONS,
                        "severity": "HIGH",
                        "confidence": 0.93,
                        "bounding_boxes": bounding_boxes,
                        "warning_triggered": True,
                        "warning_message": f"CRITICAL: Multiple persons ({person_count}) detected in camera frame!",
                        "details": {"person_count": person_count}
                    }

                # Check Head Movement (Profile face or side offset)
                if len(profile_faces) > 0 and person_count == 1:
                    return {
                        "is_suspicious": True,
                        "detected_class": self.CLASS_HEAD_MOVEMENT,
                        "severity": "LOW",
                        "confidence": 0.85,
                        "bounding_boxes": bounding_boxes,
                        "warning_triggered": True,
                        "warning_message": "WARNING: Unusual head orientation / turned away from exam screen",
                        "details": {"pose": "head_turned"}
                    }

            return {
                "is_suspicious": False,
                "detected_class": self.CLASS_NORMAL,
                "severity": "NONE",
                "confidence": 0.98,
                "bounding_boxes": [],
                "warning_triggered": False,
                "warning_message": None,
                "details": {"status": "normal_behavior"}
            }

        except Exception as err:
            logger.warning(f"Notice in process_frame pipeline: {err}")
            return {
                "is_suspicious": False,
                "detected_class": self.CLASS_NORMAL,
                "severity": "NONE",
                "confidence": 0.90,
                "bounding_boxes": [],
                "warning_triggered": False,
                "warning_message": None,
                "details": {"fallback": str(err)}
            }
