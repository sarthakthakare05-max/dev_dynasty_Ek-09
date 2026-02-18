from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class CourseRecommendation(BaseModel):
    skill: str
    courses: List[str]

class MatchResult(BaseModel):
    job_id: str
    score: float
    matched_skills: List[str]
    missing_skills: List[str]
    experience_gap: str
    course_recommendations: List[CourseRecommendation]
    
class MatchResponse(MatchResult):
    id: str = Field(alias="_id")
