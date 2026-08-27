from typing import List, Optional
from fastapi import APIRouter
from app.core.database import get_database

router = APIRouter()

@router.get("/", response_model=List[dict])
async def list_exam_reports(exam_id: Optional[str] = None, student_id: Optional[str] = None):
    db = get_database()
    query = {}
    if exam_id:
        query["exam_id"] = exam_id
    if student_id:
        query["student_id"] = student_id
        
    cursor = db.reports.find(query).sort("submitted_at", -1)
    reports = []
    async for r in cursor:
        r["_id"] = str(r["_id"])
        r["id"] = r["_id"]
        reports.append(r)
    return reports

@router.get("/summary", response_model=dict)
async def get_reports_summary():
    db = get_database()
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

@router.get("/{exam_id}", response_model=List[dict])
async def get_reports_by_exam_id(exam_id: str):
    db = get_database()
    cursor = db.reports.find({"exam_id": exam_id}).sort("submitted_at", -1)
    reports = []
    async for r in cursor:
        r["_id"] = str(r["_id"])
        r["id"] = r["_id"]
        reports.append(r)
    return reports
