import requests
import json
import sys

BASE_URL = "http://localhost:8000"

def verify_api():
    print("--- 1. FETCHING RESUME ---")
    # We need a user ID. Let's try to list resumes or use a known one if possible.
    # Since we can't list resumes easily without a known ID, we'll try to upload one if needed, 
    # OR we can assume the user 'sarthak' or 'test' exists from previous steps.
    # Actually, the user's file is named "Sarthak Thakare - Resume.pdf".
    # The user_id is likely the email they used. 
    # Let's try to use the raw resume list if available, or just use a hardcoded user_id if we saw one in logs.
    # In the `debug_resume_parsing.py` output, we didn't see the user_id. 
    # But `upload_resume` takes `user_id`.
    
    # Strategy: Upload the resume again as 'debug_user' to be sure.
    user_id = "debug_user@example.com"
    resume_path = "backend/uploads/0a5efab2-23f3-4334-b654-9de4623291f4_Sarthak Thakare - Resume.pdf"
    
    # If the specific file doesn't exist (cleaned up?), search for one.
    import os
    if not os.path.exists(resume_path):
        upload_dir = "backend/uploads"
        files = [f for f in os.listdir(upload_dir) if f.endswith(".pdf")]
        if files:
            resume_path = os.path.join(upload_dir, files[0])
        else:
            print("No PDF found to upload.")
            return

    print(f"Uploading {resume_path} for {user_id}...")
    with open(resume_path, 'rb') as f:
        files = {'file': f}
        res = requests.post(f"{BASE_URL}/resumes/?user_id={user_id}", files=files)
        
    if res.status_code != 200:
        print(f"Upload failed: {res.text}")
        return
        
    resume_data = res.json()
    print(f"✅ Resume Uploaded. Skills: {resume_data.get('skills')}")
    
    print("\n--- 2. CREATING JOB ---")
    job_data = {
        "title": "Debug Python Dev",
        "company_name": "Debug Inc",
        "description": "Validation job",
        "required_skills": ["Python", "FastAPI", "React", "Docker", "NonExistentSkill"],
        "required_experience": 0,
        "min_cgpa": 0
    }
    # Create job endpoint expects recruiter_id
    res = requests.post(f"{BASE_URL}/jobs/?recruiter_id=recruiter@debug.com", json=job_data)
    if res.status_code != 200:
        print(f"Job creation failed: {res.text}")
        return
    
    # Debug response
    print(f"Job Response: {res.text}")
    resp_json = res.json()
    job_id = resp_json.get("id") or resp_json.get("_id")
    if not job_id:
        print("ERROR: Could not find job ID in response")
        return
    print(f"✅ Job Created: {job_id}")
    
    print("\n--- 3. CALCULATING MATCH ---")
    res = requests.post(f"{BASE_URL}/matches/{job_id}?applicant_id={user_id}")
    
    if res.status_code != 200:
        print(f"Match failed: {res.text}")
        return
        
    match = res.json()
    print("\n--- MATCH RESULT ---")
    print(f"Score: {match['score']}%")
    print(f"Matched Skills: {match['matched_skills']}")
    print(f"Missing Skills: {match['missing_skills']}")
    
    if match['score'] > 0:
        print("\nSUCCESS: System is working perfectly!")
    else:
        print("\nWARNING: Score is 0.")

if __name__ == "__main__":
    try:
        verify_api()
    except Exception as e:
        print(f"Error: {e}")
        print("Is the backend running?")
