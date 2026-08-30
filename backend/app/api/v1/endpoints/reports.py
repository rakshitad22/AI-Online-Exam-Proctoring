import logging
from typing import List, Optional
from bson import ObjectId
from datetime import datetime
from fastapi import APIRouter
from app.core.database import get_database

logger = logging.getLogger("ai_proctoring.reports")

def to_jsonable_dict(doc: dict) -> dict:
    if not isinstance(doc, dict):
        return doc
    clean = {}
    for k, v in doc.items():
        if isinstance(v, ObjectId):
            clean[k] = str(v)
        elif isinstance(v, datetime):
            clean[k] = v.isoformat()
        elif isinstance(v, list):
            clean[k] = [to_jsonable_dict(item) if isinstance(item, dict) else (str(item) if isinstance(item, ObjectId) else item) for item in v]
        elif isinstance(v, dict):
            clean[k] = to_jsonable_dict(v)
        else:
            clean[k] = v
    if "_id" in clean:
        clean["_id"] = str(clean["_id"])
        clean["id"] = clean["_id"]
    return clean

router = APIRouter()

@router.get("/", response_model=List[dict])
@router.get("", response_model=List[dict])
async def list_exam_reports(exam_id: Optional[str] = None, student_id: Optional[str] = None):
    db = get_database()
    if db is None:
        return []
    try:
        query = {}
        if exam_id:
            query["exam_id"] = exam_id
        if student_id:
            query["student_id"] = student_id
            
        cursor = db.reports.find(query).sort("submitted_at", -1)
        reports = []
        async for r in cursor:
            reports.append(to_jsonable_dict(r))
        return reports
    except Exception as err:
        logger.warning(f"list_exam_reports error: {err}")
        return []

@router.get("/summary", response_model=dict)
async def get_reports_summary():
    db = get_database()
    if db is None:
        return {
            "total_students": 0, "total_exams": 0, "total_reports": 0, "total_violations": 0,
            "flagged_reports": 0, "passed_reports": 0, "failed_reports": 0
        }
    try:
        total_students = await db.users.count_documents({"role": "student"})
        total_exams = await db.exams.count_documents({})
        total_reports = await db.reports.count_documents({})
        total_violations = await db.violations.count_documents({})
        
        flagged_reports = await db.reports.count_documents({"status": "FLAGGED_FOR_REVIEW"})
        passed_reports = await db.reports.count_documents({"status": "PASSED"})
        failed_reports = await db.reports.count_documents({"status": "FAILED"})

        return {
            "total_students": total_students,
            "total_exams": total_exams,
            "total_reports": total_reports,
            "total_violations": total_violations,
            "flagged_reports": flagged_reports,
            "passed_reports": passed_reports,
            "failed_reports": failed_reports
        }
    except Exception as err:
        logger.warning(f"get_reports_summary error: {err}")
        return {
            "total_students": 0, "total_exams": 0, "total_reports": 0, "total_violations": 0,
            "flagged_reports": 0, "passed_reports": 0, "failed_reports": 0
        }

@router.get("/{exam_id}", response_model=List[dict])
async def get_reports_by_exam_id(exam_id: str):
    db = get_database()
    if db is None:
        return []
    try:
        cursor = db.reports.find({"exam_id": exam_id}).sort("submitted_at", -1)
        reports = []
        async for r in cursor:
            reports.append(to_jsonable_dict(r))
        return reports
    except Exception as err:
        logger.warning(f"get_reports_by_exam_id error: {err}")
        return []
