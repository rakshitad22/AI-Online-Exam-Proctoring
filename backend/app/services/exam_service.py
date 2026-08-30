from typing import List, Optional
from bson import ObjectId
from datetime import datetime
from fastapi import HTTPException, status
from app.core.database import get_database
from app.schemas.exam import ExamCreate, SubmitExamRequest

async def create_exam(exam_in: ExamCreate, admin_id: str) -> dict:
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database service unavailable")
    doc = exam_in.dict()
    doc["created_by"] = admin_id
    doc["is_active"] = True
    doc["created_at"] = datetime.utcnow()
    
    result = await db.exams.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    doc["id"] = str(result.inserted_id)
    doc["question_count"] = len(doc.get("questions", []))
    return doc

async def get_all_exams() -> List[dict]:
    db = get_database()
    if db is None:
        return []
    exams = []
    cursor = db.exams.find({})
    async for exam in cursor:
        exam["_id"] = str(exam["_id"])
        exam["id"] = exam["_id"]
        exam["question_count"] = len(exam.get("questions", []))
        exams.append(exam)
    return exams

async def get_exam_by_id(exam_id: str) -> dict:
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database service unavailable")
    try:
        obj_id = ObjectId(exam_id)
    except Exception:
        # Fallback string search if custom ID
        exam = await db.exams.find_one({"id": exam_id})
        if exam:
            exam["_id"] = str(exam["_id"])
            exam["question_count"] = len(exam.get("questions", []))
            return exam
        raise HTTPException(status_code=400, detail="Invalid Exam ID format")
    
    exam = await db.exams.find_one({"_id": obj_id})
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    exam["_id"] = str(exam["_id"])
    exam["id"] = exam["_id"]
    exam["question_count"] = len(exam.get("questions", []))
    return exam

async def update_exam(exam_id: str, exam_data: dict) -> dict:
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database service unavailable")
    try:
        obj_id = ObjectId(exam_id)
        query = {"_id": obj_id}
    except Exception:
        query = {"id": exam_id}

    exam_data.pop("_id", None)
    exam_data.pop("id", None)
    exam_data["updated_at"] = datetime.utcnow()

    res = await db.exams.update_one(query, {"$set": exam_data})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Exam not found for update")
    return await get_exam_by_id(exam_id)

async def delete_exam(exam_id: str) -> dict:
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database service unavailable")
    try:
        obj_id = ObjectId(exam_id)
        query = {"_id": obj_id}
    except Exception:
        query = {"id": exam_id}

    res = await db.exams.delete_one(query)
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Exam not found for deletion")
    return {"message": "Exam deleted successfully", "exam_id": exam_id}

async def toggle_exam_active(exam_id: str) -> dict:
    exam = await get_exam_by_id(exam_id)
    new_state = not exam.get("is_active", True)
    return await update_exam(exam_id, {"is_active": new_state})

async def submit_exam_and_evaluate(req: SubmitExamRequest, student_id: str, student_name: str) -> dict:
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database service unavailable")
    exam = await get_exam_by_id(req.exam_id)
    
    questions = exam.get("questions", [])
    total_marks = exam.get("total_marks", 100)
    user_answers = req.answers
    
    obtained_marks = 0
    correct_count = 0
    wrong_count = 0
    unanswered_count = 0

    for q in questions:
        q_id = q.get("id")
        correct_opt = q.get("correct_option")
        q_marks = q.get("marks", 1)
        
        if q_id not in user_answers or user_answers[q_id] is None:
            unanswered_count += 1
        elif str(user_answers[q_id]) == str(correct_opt):
            obtained_marks += q_marks
            correct_count += 1
        else:
            wrong_count += 1

    passing_marks = exam.get("passing_marks", total_marks * 0.4)
    status_str = "PASSED" if obtained_marks >= passing_marks else "FAILED"
    
    if req.total_warnings >= 3:
        status_str = "FLAGGED_FOR_REVIEW"

    # Fetch user violations for risk calculation
    user_violations_cursor = db.violations.find({"exam_id": req.exam_id, "student_id": student_id})
    user_violations = await user_violations_cursor.to_list(length=500)
    
    from app.services.proctor_service import calculate_risk_score_and_category
    risk_score, risk_category = calculate_risk_score_and_category(user_violations)
    
    report_doc = {
        "exam_id": req.exam_id,
        "exam_title": exam.get("title", "Exam"),
        "student_id": student_id,
        "student_name": student_name,
        "score": obtained_marks,
        "total_marks": total_marks,
        "correct_answers": correct_count,
        "wrong_answers": wrong_count,
        "unanswered": unanswered_count,
        "status": status_str,
        "total_warnings": req.total_warnings,
        "risk_score": risk_score,
        "risk_category": risk_category,
        "violation_count": len(user_violations),
        "submitted_at": datetime.utcnow()
    }
    
    res = await db.reports.insert_one(report_doc)
    report_doc["_id"] = str(res.inserted_id)
    report_doc["id"] = report_doc["_id"]

    # Mark attempt submitted
    await db.exam_attempts.update_one(
        {"exam_id": req.exam_id, "student_id": student_id},
        {"$set": {"submitted": True, "submitted_at": datetime.utcnow(), "status": "COMPLETED"}}
    )

    return report_doc
