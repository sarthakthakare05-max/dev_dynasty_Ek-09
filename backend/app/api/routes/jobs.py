from fastapi import APIRouter, HTTPException, Depends
from app.models.job import JobCreate, JobResponse
from app.core.database import get_collection
from uuid import uuid4
from datetime import datetime
from typing import List

router = APIRouter()
jobs_collection = get_collection("jobs")

@router.post("/", response_model=JobResponse)
async def create_job(job: JobCreate, recruiter_id: str): # recruiter_id mock passed for now
    job_id = str(uuid4())
    job_dict = {
        "_id": job_id,
        "recruiter_id": recruiter_id,
        **job.dict(),
        "created_at": datetime.utcnow()
    }
    await jobs_collection.insert_one(job_dict)
    return {**job_dict, "id": job_id}

@router.get("/", response_model=List[JobResponse])
async def list_jobs():
    cursor = jobs_collection.find()
    jobs = []
    async for doc in cursor:
        doc["id"] = doc["_id"]
        jobs.append(doc)
    return jobs

@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: str):
    job = await jobs_collection.find_one({"_id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job["id"] = job["_id"]
    return job
