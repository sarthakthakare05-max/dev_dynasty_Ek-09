from pydantic import BaseModel, Field
from typing import List
from datetime import datetime

class ResumeInDB(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    skills: List[str]
    experience_years: int
    raw_text: str
    file_path: str
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)

class ResumeResponse(BaseModel):
    id: str
    skills: List[str]
    experience_years: int
    file_path: str
