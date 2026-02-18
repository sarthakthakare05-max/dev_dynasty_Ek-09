import requests
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = "resume_matcher_db"

async def debug_jobs():
    print("--- DEBUGGING JOBS ---")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    idx = 0
    target_job_id = None
    
    async for job in db["jobs"].find():
        idx += 1
        print(f"Job {idx}: ID={job['_id']} (Type: {type(job['_id'])}) | Title={job.get('title')}")
        target_job_id = job['_id']
        
    if not target_job_id:
        print("NO JOBS FOUND IN DB!")
        return

    print(f"\nTarget Job ID: {target_job_id}")
    
    # Test API
    print("\n--- TESTING MATCH API ---")
    applicant_email = "test_parser@test.com" # From previous step
    url = f"http://localhost:8000/matches/{target_job_id}?applicant_id={applicant_email}"
    
    try:
        res = requests.post(url)
        print(f"API Response Code: {res.status_code}")
        print(f"API Response Body: {res.text}")
    except Exception as e:
        print(f"API Request Failed: {e}")

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    loop.run_until_complete(debug_jobs())
