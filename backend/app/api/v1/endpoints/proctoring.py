from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from app.schemas.proctoring import FrameAnalysisRequest, FrameAnalysisResponse, LogViolationRequest
from app.services.proctor_service import (
    analyze_webcam_frame,
    log_manual_violation,
    get_all_violations,
    get_proctoring_status
)

router = APIRouter()

@router.post("/analyze-frame", response_model=FrameAnalysisResponse)
async def analyze_frame(req: FrameAnalysisRequest):
    return await analyze_webcam_frame(req)

@router.post("/violations", response_model=dict)
async def create_violation(req: LogViolationRequest):
    return await log_manual_violation(req)

@router.get("/violations", response_model=List[dict])
async def list_all_violations(exam_id: Optional[str] = None):
    return await get_all_violations(exam_id=exam_id)

@router.get("/violations/{exam_id}", response_model=List[dict])
async def list_exam_violations(exam_id: str):
    return await get_all_violations(exam_id=exam_id)

@router.get("/status/{exam_id}", response_model=dict)
async def fetch_status(exam_id: str):
    return await get_proctoring_status(exam_id=exam_id)
