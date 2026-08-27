from typing import Dict, Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class ExamReportInDB(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    exam_id: str
    exam_title: str
    student_id: str
    student_name: str
    score: int
    total_marks: int
    status: str # "PASSED", "FAILED", "FLAGGED_FOR_REVIEW"
    total_warnings: int
    risk_score: float # 0.0 - 1.0 calculated based on violations
    violation_counts: Dict[str, int] = {}
    submitted_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
