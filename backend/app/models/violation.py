from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class ViolationInDB(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    exam_id: str
    student_id: str
    student_name: Optional[str] = None
    violation_type: str # External device, Head movement, Multiple persons, Talking
    confidence: float
    snapshot_data: Optional[str] = None # Base64 thumbnail snapshot
    details: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
