import logging
from typing import List, Optional
from bson import ObjectId
from datetime import datetime
from fastapi import HTTPException, status
from app.core.database import get_database
from app.schemas.exam import ExamCreate, SubmitExamRequest

logger = logging.getLogger("ai_proctoring.exam_service")

try:
    from seed_data import exams_list as DEFAULT_EXAMS_LIST
except ImportError:
    try:
        from backend.seed_data import exams_list as DEFAULT_EXAMS_LIST
    except ImportError:
        DEFAULT_EXAMS_LIST = []

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
    
    if not exams and DEFAULT_EXAMS_LIST:
        for ex in DEFAULT_EXAMS_LIST:
            clean_ex = to_jsonable_dict(dict(ex))
            clean_ex["_id"] = clean_ex.get("_id", "exam_" + clean_ex["title"].lower().replace(" ", "_").replace(":", ""))
            clean_ex["id"] = clean_ex["_id"]
            clean_ex["question_count"] = len(clean_ex.get("questions", []))
            exams.append(clean_ex)
            
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
    
    # Fallback matching by ID or title slug
    if DEFAULT_EXAMS_LIST:
        for ex in DEFAULT_EXAMS_LIST:
            slug = "exam_" + ex["title"].lower().replace(" ", "_").replace(":", "")
            if exam_id == slug or exam_id == ex.get("_id") or exam_id == ex.get("id"):
                clean_ex = to_jsonable_dict(dict(ex))
                clean_ex["_id"] = slug
                clean_ex["id"] = slug
                clean_ex["question_count"] = len(clean_ex.get("questions", []))
                return clean_ex
        # Return first exam if ID not matched
        clean_ex = to_jsonable_dict(dict(DEFAULT_EXAMS_LIST[0]))
        clean_ex["_id"] = exam_id
        clean_ex["id"] = exam_id
        clean_ex["question_count"] = len(clean_ex.get("questions", []))
        return clean_ex

    raise HTTPException(status_code=404, detail="Exam not found")

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
        marks = q.get("marks", 5)
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
    
    risk_score = min(100.0, float(req.total_warnings * 25))
    if req.total_warnings >= 3:
        status_result = "FLAGGED_FOR_REVIEW"
        risk_category = "CRITICAL"
    elif score < passing_marks:
        status_result = "FAILED"
        risk_category = "HIGH RISK" if risk_score >= 50 else ("MEDIUM" if risk_score >= 20 else "LOW")
    else:
        status_result = "PASSED"
        risk_category = "HIGH RISK" if risk_score >= 50 else ("MEDIUM" if risk_score >= 20 else "LOW")
    
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
        "risk_score": risk_score,
        "risk_category": risk_category,
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
