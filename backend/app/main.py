from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import db
from app.api.routes import auth, jobs, resumes, matches

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

# API Routes
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(jobs.router, prefix="/jobs", tags=["Job Management"])
app.include_router(resumes.router, prefix="/resumes", tags=["Resume Management"])
app.include_router(matches.router, prefix="/matches", tags=["Matching Engine"])

@app.on_event("startup")
async def startup_db_client():
    db.connect()

@app.on_event("shutdown")
async def shutdown_db_client():
    db.close()

@app.get("/")
def read_root():
    return {"message": "Resume Matcher API is running"}
