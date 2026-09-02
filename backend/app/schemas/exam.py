from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class Question(BaseModel):
    id: str
    question_text: str
    options: List[str]
    correct_option: int # Index of correct option
    marks: int = 1

class ExamBase(BaseModel):
    title: str
    description: str
    duration_minutes: int
    total_marks: int
    passing_marks: int
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    is_active: bool = True

class ExamCreate(ExamBase):
    questions: List[Question]

class ExamResponse(ExamBase):
    id: str = Field(alias="_id")
    created_by: str
    question_count: int
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True

class ExamDetailResponse(ExamResponse):
    questions: List[Question]

class SubmitExamRequest(BaseModel):
    exam_id: str
    answers: dict # question_id -> selected_option_index
    total_warnings: int = 0
    violation_summary: Optional[dict] = None
    student_id: Optional[str] = "CS-2024-076"
    student_name: Optional[str] = "RakshitaD76"
