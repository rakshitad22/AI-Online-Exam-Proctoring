from datetime import datetime
from typing import Dict, Any, List, Tuple
from app.core.database import get_database
from app.core.config import settings

try:
    from vision.detector import AbnormalActivityDetector
except ImportError:
    from backend.vision.detector import AbnormalActivityDetector

from app.schemas.proctoring import FrameAnalysisRequest, FrameAnalysisResponse, LogViolationRequest, BoundingBox

detector = AbnormalActivityDetector()

def calculate_risk_score_and_category(violations: List[Dict[str, Any]]) -> Tuple[float, str]:
    total_score = 0.0
    for v in violations:
        v_type = v.get("violation_type") or v.get("activity") or ""
        if "EXTERNAL_DEVICE" in v_type or "mobile phone" in v_type.lower():
            total_score += settings.WEIGHT_EXTERNAL_DEVICE
        elif "MULTIPLE_PERSONS" in v_type or "multiple persons" in v_type.lower():
            total_score += settings.WEIGHT_MULTIPLE_PERSONS
        elif "BACKGROUND_NOISE" in v_type or "noise" in v_type.lower() or "audio" in v_type.lower():
            total_score += settings.WEIGHT_BACKGROUND_NOISE
        elif "TALKING" in v_type or "talking" in v_type.lower():
            total_score += settings.WEIGHT_TALKING
        elif "HEAD_MOVEMENT" in v_type or "head movement" in v_type.lower():
            total_score += settings.WEIGHT_HEAD_MOVEMENT

    normalized_score = min(100.0, float(total_score))

    if normalized_score < 20.0:
        category = "LOW"
    elif normalized_score < 50.0:
        category = "MEDIUM"
    elif normalized_score < 75.0:
        category = "HIGH"
    else:
        category = "CRITICAL"

    return normalized_score, category

async def analyze_webcam_frame(req: FrameAnalysisRequest) -> FrameAnalysisResponse:
    db = get_database()
    
    # Process frame with OpenCV Detector (loads model lazily if needed)
    res = detector.process_frame(req.frame_data)
    
    is_violation = res["is_suspicious"]
    detected_class = res["detected_class"]
    severity = res.get("severity", "NONE")
    confidence = res["confidence"]
    message = res.get("warning_message")
    
    # Normalize activity code name for API standards
    activity_code = "NORMAL"
    if "External device" in detected_class:
        activity_code = "EXTERNAL_DEVICE"
    elif "Multiple persons" in detected_class:
        activity_code = "MULTIPLE_PERSONS"
    elif "Head movement" in detected_class:
        activity_code = "HEAD_MOVEMENT"
    elif "Talking" in detected_class:
        activity_code = "TALKING"

    # Map BoundingBox objects
    boxes = [
        BoundingBox(
            x1=b["x1"], y1=b["y1"], x2=b["x2"], y2=b["y2"], label=b["label"], confidence=b["confidence"]
        ) for b in res.get("bounding_boxes", [])
    ]

    # Save violation to MongoDB if flagged
    if is_violation and db is not None:
        violation_doc = {
            "exam_id": req.exam_id,
            "student_id": req.student_id,
            "violation_type": activity_code,
            "detected_class": detected_class,
            "severity": severity,
            "confidence": confidence,
            "details": message,
            "timestamp": datetime.utcnow()
        }
        await db.violations.insert_one(violation_doc)

    user_violations = []
    if db is not None:
        user_violations_cursor = db.violations.find({"exam_id": req.exam_id, "student_id": req.student_id})
        user_violations = await user_violations_cursor.to_list(length=500)
    
    warning_count = len(user_violations)
    risk_score, risk_category = calculate_risk_score_and_category(user_violations)

    if db is not None:
        attempt_query = {"exam_id": req.exam_id, "student_id": req.student_id}
        attempt_update = {
            "$set": {
                "last_active": datetime.utcnow(),
                "warning_count": warning_count,
                "risk_score": risk_score,
                "risk_category": risk_category,
                "status": "IN_PROGRESS"
            },
            "$setOnInsert": {
                "start_time": datetime.utcnow(),
                "submitted": False
            }
        }
        await db.exam_attempts.update_one(attempt_query, attempt_update, upsert=True)

    return FrameAnalysisResponse(
        activity=activity_code,
        is_violation=is_violation,
        severity=severity,
        confidence=confidence,
        message=message,
        timestamp=datetime.utcnow(),
        detections=boxes,
        warning_triggered=is_violation,
        warning_count=warning_count,
        risk_score=risk_score,
        risk_category=risk_category
    )

async def log_manual_violation(req: LogViolationRequest) -> dict:
    db = get_database()
    doc = req.dict()
    doc["timestamp"] = datetime.utcnow()
    
    if db is not None:
        result = await db.violations.insert_one(doc)
        doc["_id"] = str(result.inserted_id)
        doc["id"] = doc["_id"]
        
        user_violations_cursor = db.violations.find({"exam_id": req.exam_id, "student_id": req.student_id})
        user_violations = await user_violations_cursor.to_list(length=500)
        risk_score, risk_category = calculate_risk_score_and_category(user_violations)
        
        await db.exam_attempts.update_one(
            {"exam_id": req.exam_id, "student_id": req.student_id},
            {"$set": {"warning_count": len(user_violations), "risk_score": risk_score, "risk_category": risk_category}}
        )
    return doc

async def get_all_violations(exam_id: str = None) -> list:
    db = get_database()
    if db is None:
        return []
    query = {}
    if exam_id and exam_id != "all":
        query["exam_id"] = exam_id
    cursor = db.violations.find(query).sort("timestamp", -1)
    violations = []
    async for v in cursor:
        v["_id"] = str(v["_id"])
        v["id"] = v["_id"]
        violations.append(v)
    return violations

async def get_proctoring_status(exam_id: str) -> dict:
    db = get_database()
    if db is None:
        return {"exam_id": exam_id, "active_candidates_count": 0, "total_violations_count": 0, "candidates": []}
    
    attempts_cursor = db.exam_attempts.find({"exam_id": exam_id})
    attempts = []
    async for a in attempts_cursor:
        a["_id"] = str(a["_id"])
        a["id"] = a["_id"]
        attempts.append(a)
    
    total_violations = await db.violations.count_documents({"exam_id": exam_id})
    return {
        "exam_id": exam_id,
        "active_candidates_count": len(attempts),
        "total_violations_count": total_violations,
        "candidates": attempts
    }
