import base64
import io
from PIL import Image
import numpy as np
import cv2

def base64_to_cv2(base64_string: str) -> np.ndarray:
    """
    Decodes a base64 encoded image string into an OpenCV BGR image array.
    """
    if "," in base64_string:
        base64_string = base64_string.split(",")[1]
    image_bytes = base64.b64decode(base64_string)
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    rgb_arr = np.array(image)
    return cv2.cvtColor(rgb_arr, cv2.COLOR_RGB2BGR)

def cv2_to_base64(image_array: np.ndarray) -> str:
    """
    Encodes an OpenCV image array into a base64 JPEG string.
    """
    rgb_img = cv2.cvtColor(image_array, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(rgb_img)
    buff = io.BytesIO()
    pil_img.save(buff, format="JPEG", quality=75)
    return base64.b64encode(buff.getvalue()).decode("utf-8")

def extract_keyframe_motion(prev_frame: np.ndarray, current_frame: np.ndarray, threshold: float = 12.0) -> bool:
    """
    Motion-based keyframe selection based on mean absolute pixel difference (absdiff).
    Inspired by research paper equation: T = mean(absdiff(prev, curr))
    """
    if prev_frame is None or current_frame is None:
        return True
    
    gray_prev = cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY)
    gray_curr = cv2.cvtColor(current_frame, cv2.COLOR_BGR2GRAY)
    
    diff = cv2.absdiff(gray_prev, gray_curr)
    mean_diff = np.mean(diff)
    return mean_diff > threshold

def resize_frame_for_inference(frame: np.ndarray, target_width: int = 640) -> np.ndarray:
    """
    Resizes input frame maintaining aspect ratio for optimal inference performance.
    """
    if frame is None:
        return None
    h, w = frame.shape[:2]
    if w <= target_width:
        return frame
    aspect = h / w
    target_height = int(target_width * aspect)
    return cv2.resize(frame, (target_width, target_height), interpolation=cv2.INTER_AREA)

def non_max_suppression(boxes: np.ndarray, overlap_thresh: float = 0.4) -> np.ndarray:
    """
    Applies Non-Maximum Suppression (NMS) on bounding boxes [x1, y1, x2, y2]
    to eliminate duplicate detections of the same face/person.
    """
    if len(boxes) == 0:
        return np.array([])

    if boxes.dtype.kind == "i":
        boxes = boxes.astype("float")

    pick = []
    x1 = boxes[:, 0]
    y1 = boxes[:, 1]
    x2 = boxes[:, 2]
    y2 = boxes[:, 3]

    area = (x2 - x1 + 1) * (y2 - y1 + 1)
    idxs = np.argsort(y2)

    while len(idxs) > 0:
        last = len(idxs) - 1
        i = idxs[last]
        pick.append(i)

        xx1 = np.maximum(x1[i], x1[idxs[:last]])
        yy1 = np.maximum(y1[i], y1[idxs[:last]])
        xx2 = np.minimum(x2[i], x2[idxs[:last]])
        yy2 = np.minimum(y2[i], y2[idxs[:last]])

        w = np.maximum(0, xx2 - xx1 + 1)
        h = np.maximum(0, yy2 - yy1 + 1)

        overlap = (w * h) / area[idxs[:last]]
        idxs = np.delete(idxs, np.concatenate(([last], np.where(overlap > overlap_thresh)[0])))

    return boxes[pick].astype("int")
