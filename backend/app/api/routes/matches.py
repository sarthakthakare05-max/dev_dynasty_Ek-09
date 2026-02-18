from fastapi import APIRouter, HTTPException
from app.models.match import MatchResult, MatchResponse
from app.services.matching_engine import calculate_match_score
from app.services.recommendation import get_recommendations
from app.core.database import get_collection
from uuid import uuid4

router = APIRouter()
jobs_collection = get_collection("jobs")
resumes_collection = get_collection("resumes")
matches_collection = get_collection("matches")

@router.post("/{job_id}", response_model=MatchResponse)
async def perform_match(job_id: str, applicant_id: str):
    # 1. Fetch Job
    job = await jobs_collection.find_one({"_id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # 2. Fetch Applicant's Latest Resume
    resume = await resumes_collection.find_one({"user_id": applicant_id})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found. Please upload a resume first.")
    
    # 3. Process Logic
    score, matched, missing = calculate_match_score(
        applicant_skills=resume["skills"],
        applicant_exp=resume["experience_years"],
        job_skills=job["required_skills"],
        required_exp=job["required_experience"]
    )
    
    recommendations = get_recommendations(missing)
    
    # 4. Save Result
    match_id = str(uuid4())
    match_data = {
        "_id": match_id,
        "job_id": job_id,
        "applicant_id": applicant_id,
        "score": score,
        "matched_skills": matched,
        "missing_skills": missing,
        "experience_gap": "Required: {}y, Have: {}y".format(job["required_experience"], resume["experience_years"]),
        "course_recommendations": recommendations
    }
    
    await matches_collection.insert_one(match_data)
    
    # Prepare response
    match_data["id"] = match_data.pop("_id")
    return match_data
