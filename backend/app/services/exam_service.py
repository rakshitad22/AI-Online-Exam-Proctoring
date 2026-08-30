import logging
from typing import List, Optional
from bson import ObjectId
from datetime import datetime
from fastapi import HTTPException, status
from app.core.database import get_database
from app.schemas.exam import ExamCreate, SubmitExamRequest

logger = logging.getLogger("ai_proctoring.exam_service")

async def create_exam(exam_in: ExamCreate, admin_id: str) -> dict:
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database service unavailable")
    try:
        doc = exam_in.dict()
        doc["created_by"] = admin_id
        doc["is_active"] = True
        doc["created_at"] = datetime.utcnow()
        
        result = await db.exams.insert_one(doc)
        doc["_id"] = str(result.inserted_id)
        doc["id"] = str(result.inserted_id)
        doc["question_count"] = len(doc.get("questions", []))
        return doc
    except Exception as err:
        logger.error(f"create_exam failure: {err}")
        raise HTTPException(status_code=500, detail=f"Failed to create exam: {str(err)}")

async def get_all_exams() -> List[dict]:
    db = get_database()
    if db is None:
        return []
    exams = []
    try:
        cursor = db.exams.find({})
        async for exam in cursor:
            exam["_id"] = str(exam["_id"])
            exam["id"] = exam["_id"]
            exam["question_count"] = len(exam.get("questions", []))
            exams.append(exam)
    except Exception as err:
        logger.warning(f"get_all_exams failure: {err}")
        return []
    return exams

async def get_exam_by_id(exam_id: str) -> dict:
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database service unavailable")
    try:
        try:
            obj_id = ObjectId(exam_id)
            query = {"$or": [{"_id": obj_id}, {"id": exam_id}, {"_id": exam_id}]}
        except Exception:
            query = {"$or": [{"id": exam_id}, {"_id": exam_id}]}
        
        exam = await db.exams.find_one(query)
        if exam:
            exam["_id"] = str(exam["_id"])
            exam["question_count"] = len(exam.get("questions", []))
            return exam
        raise HTTPException(status_code=404, detail="Exam not found")
    except HTTPException:
        raise
    except Exception as err:
        logger.error(f"get_exam_by_id failure: {err}")
        raise HTTPException(status_code=500, detail=str(err))

async def update_exam(exam_id: str, exam_data: dict) -> dict:
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database service unavailable")
    try:
        try:
            obj_id = ObjectId(exam_id)
            query = {"$or": [{"_id": obj_id}, {"id": exam_id}]}
        except Exception:
            query = {"id": exam_id}
        
        exam_data["updated_at"] = datetime.utcnow()
        await db.exams.update_one(query, {"$set": exam_data})
        return await get_exam_by_id(exam_id)
    except HTTPException:
        raise
    except Exception as err:
        logger.error(f"update_exam failure: {err}")
        raise HTTPException(status_code=500, detail=str(err))

async def delete_exam(exam_id: str) -> dict:
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database service unavailable")
    try:
        try:
            obj_id = ObjectId(exam_id)
            query = {"$or": [{"_id": obj_id}, {"id": exam_id}]}
        except Exception:
            query = {"id": exam_id}
        
        await db.exams.delete_one(query)
        return {"status": "success", "message": "Exam deleted successfully", "exam_id": exam_id}
    except HTTPException:
        raise
    except Exception as err:
        logger.error(f"delete_exam failure: {err}")
        raise HTTPException(status_code=500, detail=str(err))

async def toggle_exam_active(exam_id: str) -> dict:
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database service unavailable")
    try:
        exam = await get_exam_by_id(exam_id)
        new_status = not exam.get("is_active", True)
        return await update_exam(exam_id, {"is_active": new_status})
    except HTTPException:
        raise
    except Exception as err:
        logger.error(f"toggle_exam_active failure: {err}")
        raise HTTPException(status_code=500, detail=str(err))

async def submit_exam_and_evaluate(req: SubmitExamRequest, student_id: str, student_name: str) -> dict:
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database service unavailable")
    try:
        exam = await get_exam_by_id(req.exam_id)
        questions = exam.get("questions", [])
        
        score = 0
        total_possible = 0
        evaluated_answers = []
        
        for q in questions:
            q_id = str(q.get("id"))
            marks = q.get("marks", 1)
            total_possible += marks
            correct_opt = q.get("correct_option")
            user_ans = req.answers.get(q_id)
            
            is_correct = (user_ans is not None and int(user_ans) == int(correct_opt))
            if is_correct:
                score += marks
                
            evaluated_answers.append({
                "question_id": q_id,
                "user_answer": user_ans,
                "correct_option": correct_opt,
                "is_correct": is_correct,
                "marks_awarded": marks if is_correct else 0
            })
            
        pct = (score / total_possible * 100) if total_possible > 0 else 0
        passing_marks = exam.get("passing_marks", total_possible * 0.4)
        status_result = "PASSED" if score >= passing_marks else "FAILED"
        
        submission_doc = {
            "exam_id": req.exam_id,
            "exam_title": exam.get("title", "Exam"),
            "student_id": student_id,
            "student_name": student_name,
            "score": score,
            "total_marks": total_possible,
            "percentage": round(pct, 2),
            "status": status_result,
            "answers": evaluated_answers,
            "total_warnings": req.total_warnings,
            "violation_summary": req.violation_summary or {},
            "submitted_at": datetime.utcnow()
        }
        
        result = await db.reports.insert_one(submission_doc)
        submission_doc["_id"] = str(result.inserted_id)
        return submission_doc
    except HTTPException:
        raise
    except Exception as err:
        logger.error(f"submit_exam_and_evaluate failure: {err}")
        raise HTTPException(status_code=500, detail=str(err))
