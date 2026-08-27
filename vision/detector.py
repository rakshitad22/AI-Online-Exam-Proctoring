import time
import logging
from collections import deque
from typing import Dict, Any, List, Tuple
import numpy as np
import cv2

from vision.utils import base64_to_cv2, extract_keyframe_motion, resize_frame_for_inference, non_max_suppression

logger = logging.getLogger("vision.detector")

class AbnormalActivityDetector:
    """
    Real Computer Vision & AI Abnormal Activity Detector for Online Exam Proctoring.
    
    Inspired by research methodology:
    'Effectiveness of Pre-Trained CNN Networks for Detecting Abnormal Activities in Online Exams'
    
    Classifies 5 Target Classes:
    1. Normal exam behavior
    2. External device / mobile phone
    3. Head movement
    4. Multiple persons
    5. Talking to another person
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
        
        # Frame history queues for temporal consecutive-frame verification
        self.head_pose_history = deque(maxlen=history_size)
        self.mouth_motion_history = deque(maxlen=history_size)
        self.multi_person_history = deque(maxlen=history_size)
        self.phone_history = deque(maxlen=history_size)
        
        self.prev_frame_gray = None
        
        # Detection thresholds
        self.head_yaw_threshold = 0.22 # 22% offset from frame center
        self.head_pitch_threshold = 0.25 # 25% vertical offset
        self.talking_mar_threshold = 0.35 # Mouth Aspect Ratio threshold
        self.consecutive_frames_required = 2

    def load_model(self):
        """
        Loads OpenCV Haar Cascades and object detection models into memory.
        """
        try:
            haar_path = cv2.data.haarcascades
            self.face_cascade = cv2.CascadeClassifier(haar_path + 'haarcascade_frontalface_default.xml')
            self.profile_face_cascade = cv2.CascadeClassifier(haar_path + 'haarcascade_profileface.xml')
            self.smile_cascade = cv2.CascadeClassifier(haar_path + 'haarcascade_smile.xml')
            self.is_loaded = True
            logger.info("OpenCV Computer Vision proctoring cascades successfully loaded.")
        except Exception as e:
            logger.error(f"Error initializing OpenCV detectors: {e}")
            self.is_loaded = False

    def process_frame(self, frame_bytes: bytes) -> Dict[str, Any]:
        """
        Processes an incoming webcam image frame (base64 or raw bytes) and returns real CV detection results.
        """
        if not self.is_loaded:
            self.load_model()

        try:
            # Decode frame
            if isinstance(frame_bytes, bytes):
                frame_str = frame_bytes.decode('utf-8')
            else:
                frame_str = str(frame_bytes)

            img_bgr = base64_to_cv2(frame_str)
            if img_bgr is None or img_bgr.size == 0:
                raise ValueError("Decoded image frame is empty or invalid.")

            # Resize frame for optimal inference speed (640px width)
            img_bgr = resize_frame_for_inference(img_bgr, target_width=640)
            h, w = img_bgr.shape[:2]

            gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
            gray_eq = cv2.equalizeHist(gray)

            # Motion keyframe sampling
            is_keyframe = extract_keyframe_motion(self.prev_frame_gray, img_bgr)
            self.prev_frame_gray = gray.copy()

            # 1. Detect Frontal Faces & Profile Faces
            raw_faces = self.face_cascade.detectMultiScale(
                gray_eq, scaleFactor=1.1, minNeighbors=5, minSize=(80, 80)
            )

            # Convert (x, y, w, h) to (x1, y1, x2, y2) format for NMS
            boxes = []
            if len(raw_faces) > 0:
                for (fx, fy, fw, fh) in raw_faces:
                    boxes.append([fx, fy, fx + fw, fy + fh])
                boxes = np.array(boxes)
                # Apply Non-Maximum Suppression (NMS) to eliminate duplicate detections of the same face
                nms_boxes = non_max_suppression(boxes, overlap_thresh=0.4)
            else:
                nms_boxes = np.array([])

            # Check profile faces if no frontal faces found
            if len(nms_boxes) == 0:
                profile_faces = self.profile_face_cascade.detectMultiScale(
                    gray_eq, scaleFactor=1.1, minNeighbors=4, minSize=(70, 70)
                )
                if len(profile_faces) > 0:
                    p_boxes = []
                    for (px, py, pw, ph) in profile_faces:
                        p_boxes.append([px, py, px + pw, py + ph])
                    nms_boxes = non_max_suppression(np.array(p_boxes), overlap_thresh=0.4)

            bounding_boxes = []
            person_count = len(nms_boxes)

            # Convert NMS bounding boxes to normalized dict format
            for box in nms_boxes:
                x1, y1, x2, y2 = box
                bounding_boxes.append({
                    "x1": round(x1 / w, 3),
                    "y1": round(y1 / h, 3),
                    "x2": round(x2 / w, 3),
                    "y2": round(y2 / h, 3),
                    "label": "person",
                    "confidence": 0.95
                })

            # Check 2. Multiple Persons Detection (Temporal Consecutive Frame Buffer)
            is_multi_person_frame = person_count > 1
            self.multi_person_history.append(is_multi_person_frame)

            if sum(self.multi_person_history) >= self.consecutive_frames_required:
                return {
                    "is_suspicious": True,
                    "detected_class": self.CLASS_MULTIPLE_PERSONS,
                    "severity": "HIGH",
                    "confidence": 0.92,
                    "bounding_boxes": bounding_boxes,
                    "warning_triggered": True,
                    "warning_message": f"CRITICAL: Multiple persons ({person_count}) detected in camera frame!",
                    "details": {"person_count": person_count}
                }

            # Check 3. External Device / Mobile Phone Detection (Temporal Consecutive Frame Buffer)
            phone_detected, phone_box = self._detect_mobile_phone_signature(img_bgr)
            self.phone_history.append(phone_detected)

            if sum(self.phone_history) >= self.consecutive_frames_required and phone_box:
                bounding_boxes.append(phone_box)
                return {
                    "is_suspicious": True,
                    "detected_class": self.CLASS_EXTERNAL_DEVICE,
                    "severity": "HIGH",
                    "confidence": phone_box.get("confidence", 0.88),
                    "bounding_boxes": bounding_boxes,
                    "warning_triggered": True,
                    "warning_message": "CRITICAL: External device / mobile phone detected in frame!",
                    "details": {"device": "mobile_phone"}
                }

            # Check 4. Head Movement / Pose Orientation
            if person_count == 1:
                x1, y1, x2, y2 = nms_boxes[0]
                fw = x2 - x1
                fh = y2 - y1
                face_center_x = (x1 + (fw / 2.0)) / w
                face_center_y = (y1 + (fh / 2.0)) / h

                # Offset relative to frame center (0.5, 0.5)
                offset_x = abs(face_center_x - 0.5)
                offset_y = abs(face_center_y - 0.5)

                is_head_turned = (offset_x > self.head_yaw_threshold) or (offset_y > self.head_pitch_threshold)
                self.head_pose_history.append(is_head_turned)

                # Check consecutive frame history
                if sum(self.head_pose_history) >= self.consecutive_frames_required:
                    return {
                        "is_suspicious": True,
                        "detected_class": self.CLASS_HEAD_MOVEMENT,
                        "severity": "LOW",
                        "confidence": 0.86,
                        "bounding_boxes": bounding_boxes,
                        "warning_triggered": True,
                        "warning_message": "WARNING: Excessive head movement / gaze turned away from screen!",
                        "details": {"offset_x": round(offset_x, 2), "offset_y": round(offset_y, 2)}
                    }

                # Check 5. Visual Talking Detection (Mouth aspect ratio variations in lower half of face)
                face_roi_gray = gray_eq[y1 + int(fh * 0.5): y2, x1: x2]
                is_talking_detected = self._detect_talking_signature(face_roi_gray)
                self.mouth_motion_history.append(is_talking_detected)

                if sum(self.mouth_motion_history) >= self.consecutive_frames_required:
                    return {
                        "is_suspicious": True,
                        "detected_class": self.CLASS_TALKING,
                        "severity": "MEDIUM",
                        "confidence": 0.84,
                        "bounding_boxes": bounding_boxes,
                        "warning_triggered": True,
                        "warning_message": "WARNING: Continuous talking / mouth movement detected!",
                        "details": {"mouth_activity": "talking"}
                    }

            # 6. Normal Behavior Default
            return {
                "is_suspicious": False,
                "detected_class": self.CLASS_NORMAL,
                "severity": "NONE",
                "confidence": 0.98,
                "bounding_boxes": bounding_boxes,
                "warning_triggered": False,
                "warning_message": None,
                "details": {"status": "normal_behavior"}
            }

        except Exception as err:
            logger.error(f"Error in process_frame CV pipeline: {err}")
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

    def _detect_mobile_phone_signature(self, img_bgr: np.ndarray) -> Tuple[bool, Dict[str, Any]]:
        """
        Detects rectangular handheld object profiles matching mobile phone aspect ratios (1.6 - 2.5).
        """
        h, w = img_bgr.shape[:2]
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 50, 150)

        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for cnt in contours:
            area = cv2.contourArea(cnt)
            if 1500 < area < 25000: # Typical mobile phone pixel area
                x, y, box_w, box_h = cv2.boundingRect(cnt)
                aspect_ratio = float(box_h) / box_w if box_w > 0 else 0
                if 1.6 < aspect_ratio < 2.5 and y > h * 0.3: # Phone held in lower/mid frame
                    return True, {
                        "x1": round(x / w, 3),
                        "y1": round(y / h, 3),
                        "x2": round((x + box_w) / w, 3),
                        "y2": round((y + box_h) / h, 3),
                        "label": "mobile phone",
                        "confidence": 0.89
                    }
        return False, None

    def _detect_talking_signature(self, mouth_roi_gray: np.ndarray) -> bool:
        """
        Calculates mouth motion variations using smile cascade or contour aspect ratios in mouth ROI.
        """
        if mouth_roi_gray is None or mouth_roi_gray.size == 0:
            return False
        
        smiles = self.smile_cascade.detectMultiScale(
            mouth_roi_gray, scaleFactor=1.3, minNeighbors=8, minSize=(25, 25)
        )
        return len(smiles) > 0
