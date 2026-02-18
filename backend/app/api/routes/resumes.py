from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.resume import ResumeResponse
from app.core.database import get_collection
from uuid import uuid4
import os

router = APIRouter()
resumes_collection = get_collection("resumes")

@router.post("/", response_model=ResumeResponse)
async def upload_resume(user_id: str, file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    # In a real app, we'd save to cloud storage. For local hackathon, we save locally.
    upload_dir = "uploads"
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
    
    file_path = os.path.join(upload_dir, f"{uuid4()}_{file.filename}")
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
    
    # MOCK EXTRACTION (Simple logic for MVP)
    # In Phase 6, we can add real pypdf + LLM extraction
    mock_skills = ["Python", "JavaScript", "HTML", "CSS", "SQL", "Git"]
    mock_exp = 2
    
    resume_id = str(uuid4())
    resume_doc = {
        "_id": resume_id,
        "user_id": user_id,
        "skills": mock_skills,
        "experience_years": mock_exp,
        "raw_text": "Extracted text placeholder",
        "file_path": file_path
    }
    
    # Update or insert
    await resumes_collection.replace_one({"user_id": user_id}, resume_doc, upsert=True)
    
    return {
        "id": resume_id,
        "skills": mock_skills,
        "experience_years": mock_exp,
        "file_path": file_path
    }

@router.get("/{user_id}", response_model=ResumeResponse)
async def get_resume(user_id: str):
    resume = await resumes_collection.find_one({"user_id": user_id})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    resume["id"] = resume["_id"]
    return resume
