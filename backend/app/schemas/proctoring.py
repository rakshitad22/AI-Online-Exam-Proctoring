from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class FrameAnalysisRequest(BaseModel):
    exam_id: str
    student_id: str
    frame_data: str # Base64 encoded frame
    timestamp: float = Field(default_factory=lambda: datetime.utcnow().timestamp())

class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float
    label: str
    confidence: float

class FrameAnalysisResponse(BaseModel):
    activity: str # EXTERNAL_DEVICE, MULTIPLE_PERSONS, HEAD_MOVEMENT, TALKING, NORMAL
    is_violation: bool
    severity: str # HIGH, MEDIUM, LOW, NONE
    confidence: float
    message: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    detections: List[BoundingBox] = []
    warning_triggered: bool = False
    warning_count: int = 0
    risk_score: float = 0.0
    risk_category: str = "LOW" # LOW, MEDIUM, HIGH, CRITICAL

class LogViolationRequest(BaseModel):
    exam_id: str
    student_id: str
    violation_type: str
    severity: str = "MEDIUM"
    confidence: float = 0.90
    snapshot_data: Optional[str] = None
    details: Optional[str] = None
