from fastapi import APIRouter, HTTPException, Query
from app.models.application import ApplicationCreate, ApplicationResponse, ApplicationUpdateStatus
from app.core.database import get_collection
from uuid import uuid4
from datetime import datetime
from typing import List

router = APIRouter()
applications_collection = get_collection("applications")
jobs_collection = get_collection("jobs")
resumes_collection = get_collection("resumes")

@router.post("/", response_model=ApplicationResponse)
async def apply_for_job(application: ApplicationCreate):
    # 1. Check if already applied
    existing = await applications_collection.find_one({
        "job_id": application.job_id,
        "applicant_id": application.applicant_id
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="You have already applied for this job.")

    # 2. Create Application
    app_id = str(uuid4())
    app_doc = application.dict()
    app_doc["_id"] = app_id
    app_doc["status"] = "applied"
    app_doc["created_at"] = datetime.utcnow()
    
    await applications_collection.insert_one(app_doc)
    
    return app_doc

@router.get("/job/{job_id}", response_model=List[ApplicationResponse])
async def get_applications_for_job(job_id: str):
    # Fetch all applications for this job
    cursor = applications_collection.find({"job_id": job_id})
    applications = await cursor.to_list(length=1000)
    
    # Sort by score DESC (Ranking System)
    # Python sort is stable and fast for this scale
    applications.sort(key=lambda x: x["score"], reverse=True)
    
    # Enrich with applicant name/details if needed? 
    # For now, frontend can fetch details or we can aggregate.
    # To keep it fast "without error", we'll just return the app data.
    # The frontend will have the 'match_data' which contains skills/score.
    # We might need the name... 'match_data' snapshot doesn't have name usually.
    # Let's rely on frontend fetching profile OR basic enrichment here.
    
    return applications

@router.patch("/{app_id}/status")
async def update_application_status(app_id: str, status_update: ApplicationUpdateStatus):
    result = await applications_collection.update_one(
        {"_id": app_id},
        {"$set": {"status": status_update.status}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")
        
    return {"message": "Status updated successfully", "status": status_update.status}

@router.get("/my/{applicant_id}", response_model=List[ApplicationResponse])
async def get_my_applications(applicant_id: str):
    cursor = applications_collection.find({"applicant_id": applicant_id})
    applications = await cursor.to_list(length=100)
    return applications
