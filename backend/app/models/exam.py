from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class QuestionModel(BaseModel):
    id: str
    question_text: str
    options: List[str]
    correct_option: int
    marks: int = 1

class ExamInDB(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    title: str
    description: str
    duration_minutes: int
    total_marks: int
    passing_marks: int
    questions: List[QuestionModel] = []
    created_by: str # User ID of admin
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
