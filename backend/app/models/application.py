from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class ApplicationCreate(BaseModel):
    job_id: str
    applicant_id: str
    score: float
    match_data: Dict[str, Any] # Snapshot of the match result

class ApplicationUpdateStatus(BaseModel):
    status: str # "applied", "shortlisted", "rejected"

class ApplicationResponse(BaseModel):
    id: str = Field(alias="_id")
    job_id: str
    applicant_id: str
    score: float
    status: str
    match_data: Dict[str, Any]
    created_at: datetime
    
    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}
