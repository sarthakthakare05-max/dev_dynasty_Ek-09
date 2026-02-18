from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class JobCreate(BaseModel):
    title: str
    company_name: str
    description: str
    required_skills: List[str]
    required_experience: int
    min_cgpa: float = 0.0

class JobInDB(JobCreate):
    id: str = Field(alias="_id")
    recruiter_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class JobResponse(JobInDB):
    pass
