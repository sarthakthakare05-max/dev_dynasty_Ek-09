import asyncio
import sys
import os

# Setup paths
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.core.database import get_collection
from app.api.routes.matches import perform_match
from app.models.match import MatchResponse

# Mock APIs for standalone run if needed, but we'll try to use the DB directly
# actually, let's just use the service logic properly to avoid async complexity issues in a script if possible
# But we need async for DB.

async def verify_match():
    print("--- STARTING MATCH VERIFICATION ---")
    
    # 1. Get Resume
    resumes_col = get_collection("resumes")
    # Get ANY resume
    resume = await resumes_col.find_one({})
    if not resume:
        print("ERROR: No resumes found in DB. Please upload one via the UI first.")
        return

    print(f"1. Found Resume for User: {resume['user_id']}")
    print(f"   Skills: {resume.get('skills', [])}")
    
    # 2. Create Dummy Job (or get existing)
    jobs_col = get_collection("jobs")
    job = {
        "_id": "debug-job-123",
        "title": "Senior Python Developer",
        "company_name": "Debug Corp",
        "required_skills": ["Python", "FastAPI", "React", "Docker", "AWS"], # Mix of likely matches and misses
        "required_experience": 2,
        "description": "Debug job for verification."
    }
    await jobs_col.replace_one({"_id": job["_id"]}, job, upsert=True)
    print(f"2. Created Debug Job: {job['title']}")
    print(f"   Required: {job['required_skills']}")
    
    # 3. Run Logic directly (mimicking the API route)
    # We call the logic inside match_route or just invoke the engine. 
    # Let's invoke the route logic to be sure.
    
    from app.services.matching_engine import calculate_match_score
    
    score, matched, missing = calculate_match_score(
        applicant_skills=resume.get('skills', []),
        applicant_exp=resume.get('experience_years', 0),
        job_skills=job['required_skills'],
        required_exp=job['required_experience']
    )
    
    print("\n--- MATCH RESULTS ---")
    print(f"Compatibility Score: {score}%")
    print(f"✅ Matched Skills: {matched}")
    print(f"❌ Missing Skills: {missing}")
    
    if score > 0:
        print("\nSUCCESS: The system is correctly calculating matches based on extracted skills!")
    else:
        print("\nWARNING: Score is 0. Check if skills are being extracted properly.")

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(verify_match())
