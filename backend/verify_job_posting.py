import requests
import json

API_URL_JOBS = "http://localhost:8000/jobs/"
API_URL_LOGIN = "http://localhost:8000/auth/login"

# 1. Login as Recruiter
login_payload = {
    "email": "recruiter_test@test.com",
    "password": "password123",
    "role": "recruiter"
}

# Create recruiter if not exists (implicitly handled by register, but we use existing logic or just try login)
# For this test, we assume we need to register first to be sure or just try to post with a known user.
# Let's register a fresh recruiter to be safe.
requests.post("http://localhost:8000/auth/register", json=login_payload)

print("Logging in...")
login_res = requests.post(API_URL_LOGIN, json=login_payload)
token = login_res.json().get("access_token")
print(f"Token received: {bool(token)}")

# 2. Post Job with New Fields
job_payload = {
    "title": "Backend Warrior",
    "company_name": "Spartan Code",
    "min_cgpa": 8.5,
    "description": "Fight bugs with honor.",
    "required_skills": ["Python", "FastAPI"],
    "required_experience": 2
}

print("Posting Job...")
# Note: In our current main.js, we pass recruiter_id in query param. 
# The backend doesn't enforce JWT on create_job yet (it uses mock recruiter_id param as per jobs.py), 
# but let's stick to how the frontend does it: method: 'POST', query: recruiter_id=...
# Wait, jobs.py implementation: async def create_job(job: JobCreate, recruiter_id: str):
job_res = requests.post(
    f"{API_URL_JOBS}?recruiter_id={login_payload['email']}", 
    json=job_payload
)

print(f"Status: {job_res.status_code}")
print(f"Response: {job_res.text}")

if job_res.status_code == 200:
    job = job_res.json()
    if job.get("company_name") == "Spartan Code" and job.get("min_cgpa") == 8.5:
        print("SUCCESS: Company Name and CGPA saved correctly!")
    else:
        print("FAILURE: Fields missing in response.")
else:
    print("FAILURE: Job creation failed.")
