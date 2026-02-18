from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class JobCreate(BaseModel):
    title: str
    description: str
    required_skills: List[str]
    required_experience: int

class JobInDB(JobCreate):
    id: str = Field(alias="_id")
    recruiter_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class JobResponse(JobInDB):
    pass
