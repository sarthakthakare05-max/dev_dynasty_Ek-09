from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import db
from app.api.routes import auth, jobs, resumes, matches, applications

app = FastAPI(title="Resume Matcher AI")

# CORS
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles
import os

# Create uploads dir if not exists
if not os.path.exists("uploads"):
    os.makedirs("uploads")

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# API Routes
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(jobs.router, prefix="/jobs", tags=["Job Management"])
app.include_router(resumes.router, prefix="/resumes", tags=["Resume Management"])
app.include_router(matches.router, prefix="/matches", tags=["Matching Engine"])
app.include_router(applications.router, prefix="/applications", tags=["Job Applications"])

@app.on_event("startup")
async def startup_db_client():
    db.connect()

@app.on_event("shutdown")
async def shutdown_db_client():
    db.close()

@app.get("/")
def read_root():
    return {"message": "Resume Matcher API is running"}
