import logging
from datetime import datetime
from typing import Dict, Any, List, Tuple
from app.core.database import get_database
from app.core.config import settings

logger = logging.getLogger("ai_proctoring.proctor_service")

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
    
    try:
        res = detector.process_frame(req.frame_data)
    except Exception as err:
        logger.warning(f"detector.process_frame notice: {err}")
        res = {
            "is_suspicious": False,
            "detected_class": "Normal behavior",
            "severity": "NONE",
            "confidence": 0.95,
            "warning_message": None,
            "bounding_boxes": []
        }
    
    is_violation = res.get("is_suspicious", False)
    detected_class = res.get("detected_class", "Normal behavior")
    severity = res.get("severity", "NONE")
    confidence = res.get("confidence", 0.9)
    message = res.get("warning_message")
    
    activity_code = "NORMAL"
    if "External device" in detected_class:
        activity_code = "EXTERNAL_DEVICE"
    elif "Multiple persons" in detected_class:
        activity_code = "MULTIPLE_PERSONS"
    elif "Head movement" in detected_class:
        activity_code = "HEAD_MOVEMENT"
    elif "Talking" in detected_class:
        activity_code = "TALKING"

    boxes = [
        BoundingBox(
            x1=b.get("x1", 0), y1=b.get("y1", 0), x2=b.get("x2", 0), y2=b.get("y2", 0),
            label=b.get("label", "detection"), confidence=b.get("confidence", 0.9)
        ) for b in res.get("bounding_boxes", [])
    ]

    user_violations = []
    if db is not None:
        try:
            if is_violation:
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

            user_violations_cursor = db.violations.find({"exam_id": req.exam_id, "student_id": req.student_id})
            user_violations = await user_violations_cursor.to_list(length=500)
        except Exception as err:
            logger.warning(f"analyze_webcam_frame DB notice: {err}")

    warning_count = len(user_violations)
    risk_score, risk_category = calculate_risk_score_and_category(user_violations)

    if is_violation:
        user_violations.append({
            "violation_type": activity_code,
            "detected_class": detected_class,
            "severity": severity,
            "confidence": confidence
        })
        warning_count = len(user_violations)
        risk_score, risk_category = calculate_risk_score_and_category(user_violations)

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
    violation_doc = {
        "exam_id": req.exam_id,
        "student_id": req.student_id,
        "violation_type": req.violation_type,
        "severity": req.severity,
        "confidence": req.confidence,
        "snapshot_data": req.snapshot_data,
        "details": req.details,
        "timestamp": datetime.utcnow()
    }
    if db is not None:
        try:
            res = await db.violations.insert_one(violation_doc)
            violation_doc["_id"] = str(res.inserted_id)
        except Exception as err:
            logger.warning(f"log_manual_violation DB notice: {err}")

    violation_doc["_id"] = str(violation_doc.get("_id", "v_" + str(int(datetime.utcnow().timestamp()))))
    return violation_doc

async def get_all_violations(exam_id: Optional[str] = None) -> List[dict]:
    db = get_database()
    violations = []
    if db is not None:
        try:
            query = {"exam_id": exam_id} if exam_id else {}
            cursor = db.violations.find(query).sort("timestamp", -1)
            async for v in cursor:
                v["_id"] = str(v["_id"])
                v["timestamp"] = v["timestamp"].isoformat() if isinstance(v.get("timestamp"), datetime) else v.get("timestamp")
                violations.append(v)
        except Exception as err:
            logger.warning(f"get_all_violations DB notice: {err}")
    return violations

async def get_proctoring_status(exam_id: str) -> dict:
    db = get_database()
    violations = await get_all_violations(exam_id=exam_id if exam_id != 'all' else None)
    total_violations = len(violations)
    risk_score, risk_category = calculate_risk_score_and_category(violations)
    
    active_students = 1
    if db is not None:
        try:
            active_students = max(1, await db.users.count_documents({"role": "student"}))
        except Exception:
            pass

    return {
        "exam_id": exam_id,
        "active_students": active_students,
        "total_violations": total_violations,
        "risk_score": risk_score,
        "risk_category": risk_category,
        "latest_violations": violations[:10]
    }
