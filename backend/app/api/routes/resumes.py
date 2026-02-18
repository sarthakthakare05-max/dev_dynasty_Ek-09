from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.resume import ResumeResponse
from app.core.database import get_collection
from uuid import uuid4
import os

router = APIRouter()
resumes_collection = get_collection("resumes")

from app.services.resume_parser import extract_resume_data
from fastapi.responses import FileResponse

@router.post("/", response_model=ResumeResponse)
async def upload_resume(user_id: str, file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    upload_dir = "uploads"
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
    
    # Save file
    file_path = os.path.join(upload_dir, f"{str(uuid4())}_{file.filename}")
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # REAL EXTRACTION
    skills, exp, raw_text, cgpa, education = extract_resume_data(file_path)
    
    # Fallback if no skills found (helpful for testing with empty/dummy PDFs)
    if not skills:
        print("WARN: No skills found in PDF. Using defaults.")
        # skills = ["Python"] # Optional: Uncomment if you want a fallback
        
    # Check if resume exists to preserve _id
    existing_resume = await resumes_collection.find_one({"user_id": user_id})
    if existing_resume:
        resume_id = existing_resume["_id"]
    else:
        resume_id = str(uuid4())

    resume_doc = {
        "_id": resume_id,
        "user_id": user_id,
        "skills": skills,
        "experience_years": exp,
        "raw_text": raw_text,
        "file_path": file_path,
        "extracted_cgpa": cgpa,
        "extracted_education": education
    }
    
    await resumes_collection.replace_one({"user_id": user_id}, resume_doc, upsert=True)
    
    return {
        "id": resume_id,
        "skills": skills,
        "experience_years": exp,
        "file_path": file_path,
        "extracted_cgpa": cgpa,
        "extracted_education": education
    }

@router.get("/file/{filename}")
async def get_resume_file(filename: str):
    file_path = os.path.join("uploads", filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)

@router.get("/{user_id}", response_model=ResumeResponse)
async def get_resume(user_id: str):
    resume = await resumes_collection.find_one({"user_id": user_id})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    resume["id"] = resume["_id"]
    return resume
