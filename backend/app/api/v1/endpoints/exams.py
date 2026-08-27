from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, status
from app.schemas.exam import ExamCreate, SubmitExamRequest
from app.services.exam_service import (
    create_exam,
    get_all_exams,
    get_exam_by_id,
    update_exam,
    delete_exam,
    toggle_exam_active,
    submit_exam_and_evaluate
)

router = APIRouter()

@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_new_exam(exam_in: ExamCreate):
    return await create_exam(exam_in, admin_id="admin_system")

@router.get("/", response_model=List[dict])
@router.get("", response_model=List[dict])
async def get_exams():
    return await get_all_exams()

@router.get("/{exam_id}", response_model=dict)
async def get_exam(exam_id: str):
    return await get_exam_by_id(exam_id)

@router.put("/{exam_id}", response_model=dict)
async def update_exam_route(exam_id: str, exam_data: Dict[str, Any]):
    return await update_exam(exam_id, exam_data)

@router.delete("/{exam_id}", response_model=dict)
async def delete_exam_route(exam_id: str):
    return await delete_exam(exam_id)

@router.patch("/{exam_id}/toggle-active", response_model=dict)
async def toggle_active_route(exam_id: str):
    return await toggle_exam_active(exam_id)

@router.post("/submit", response_model=dict)
async def submit_exam(req: SubmitExamRequest):
    return await submit_exam_and_evaluate(req, student_id="std_demo_01", student_name="Student Candidate")
