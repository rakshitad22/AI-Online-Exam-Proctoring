from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

class UserInDB(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    email: EmailStr
    full_name: str
    hashed_password: str
    role: str = "student" # "student" or "admin"
    student_id: Optional[str] = None
    department: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
