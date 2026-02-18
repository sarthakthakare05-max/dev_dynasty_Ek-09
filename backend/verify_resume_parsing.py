import requests
from fpdf import FPDF
import os

# 1. Create a dummy PDF with specific skills
pdf = FPDF()
pdf.add_page()
pdf.set_font("Arial", size=12)
pdf.cell(200, 10, txt="John Doe Resume", ln=1, align="C")
pdf.cell(200, 10, txt="Skills: Python, React, Docker, AWS", ln=2, align="L")
pdf.cell(200, 10, txt="Experience: 5 years of software development", ln=3, align="L")
pdf_filename = "test_resume.pdf"
pdf.output(pdf_filename)

# 2. Upload PDF
url = "http://localhost:8000/resumes/?user_id=test_parser@test.com"
files = {'file': open(pdf_filename, 'rb')}

try:
    print("Uploading PDF...")
    response = requests.post(url, files=files)
    if response.status_code == 200:
        data = response.json()
        print("Response:", data)
        
        # Verify extraction
        skills = [s.lower() for s in data.get("skills", [])]
        if "python" in skills and "react" in skills and "docker" in skills:
            print("SUCCESS: Skills extracted correctly!")
        else:
            print("FAILURE: Skills mismatch.")
            
        if data.get("experience_years") == 5:
            print("SUCCESS: Experience extracted correctly!")
        else:
            print(f"FAILURE: Experience mismatch. Got {data.get('experience_years')}")
            
        # Verify file serving
        file_path = data.get("file_path")
        # Fix path for URL (Windows \)
        file_url_path = file_path.replace("\\", "/")
        static_url = f"http://localhost:8000/{file_url_path}"
        print(f"Testing File URL: {static_url}")
        
        file_res = requests.get(static_url)
        if file_res.status_code == 200:
             print("SUCCESS: PDF file is accessible via URL!")
        else:
             print(f"FAILURE: Could not access PDF at {static_url}")

    else:
        print(f"Upload failed: {response.status_code} {response.text}")
finally:
    files['file'].close()
    if os.path.exists(pdf_filename):
        os.remove(pdf_filename)
