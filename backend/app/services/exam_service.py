import logging
from typing import List, Optional
from bson import ObjectId
from datetime import datetime
from fastapi import HTTPException, status
from app.core.database import get_database
from app.schemas.exam import ExamCreate, SubmitExamRequest

logger = logging.getLogger("ai_proctoring.exam_service")

DEFAULT_SAMPLE_EXAM = {
    "_id": "exam_sample_01",
    "id": "exam_sample_01",
    "title": "Computer Science & AI Fundamentals Exam",
    "description": "Comprehensive live proctored evaluation covering Machine Learning, Data Structures, and System Architecture.",
    "duration_minutes": 30,
    "total_marks": 20,
    "passing_marks": 8,
    "is_active": True,
    "question_count": 2,
    "questions": [
        {
            "id": "q1",
            "question_text": "Which algorithm is commonly used for real-time object detection in webcam video frames?",
            "options": ["YOLO (You Only Look Once)", "Dijkstra's Algorithm", "Binary Search", "Bubble Sort"],
            "correct_option": 0,
            "marks": 10
        },
        {
            "id": "q2",
            "question_text": "In online exam proctoring, what indicator triggers a MULTIPLE_PERSONS violation?",
            "options": ["Background audio music", "More than 1 face detected in frame", "Closing the tab", "Low battery level"],
            "correct_option": 1,
            "marks": 10
        }
    ]
}

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
        return to_jsonable_dict(doc)
    except Exception as err:
        logger.error(f"create_exam failure: {err}")
        raise HTTPException(status_code=500, detail=f"Failed to create exam: {str(err)}")

async def get_all_exams() -> List[dict]:
    db = get_database()
    exams = []
    if db is not None:
        try:
            cursor = db.exams.find({})
            async for exam in cursor:
                clean_exam = to_jsonable_dict(exam)
                clean_exam["question_count"] = len(clean_exam.get("questions", []))
                exams.append(clean_exam)
        except Exception as err:
            logger.warning(f"get_all_exams DB notice: {err}")
    
    if not exams:
        exams.append(DEFAULT_SAMPLE_EXAM)
    return exams

async def get_exam_by_id(exam_id: str) -> dict:
    db = get_database()
    if db is not None:
        try:
            try:
                obj_id = ObjectId(exam_id)
                query = {"$or": [{"_id": obj_id}, {"id": exam_id}, {"_id": exam_id}]}
            except Exception:
                query = {"$or": [{"id": exam_id}, {"_id": exam_id}]}
            
            exam = await db.exams.find_one(query)
            if exam:
                clean_exam = to_jsonable_dict(exam)
                clean_exam["question_count"] = len(clean_exam.get("questions", []))
                return clean_exam
        except Exception as err:
            logger.error(f"get_exam_by_id DB notice: {err}")
    
    if exam_id == DEFAULT_SAMPLE_EXAM["id"] or exam_id == DEFAULT_SAMPLE_EXAM["_id"]:
        return DEFAULT_SAMPLE_EXAM
    return DEFAULT_SAMPLE_EXAM

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
        "_id": "sub_" + str(int(datetime.utcnow().timestamp())),
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
        "submitted_at": datetime.utcnow().isoformat()
    }
    
    if db is not None:
        try:
            result = await db.reports.insert_one(submission_doc)
            submission_doc["_id"] = str(result.inserted_id)
        except Exception as err:
            logger.warning(f"submit_exam_and_evaluate DB insert notice: {err}")

    return to_jsonable_dict(submission_doc)
