# Resume Matcher AI

A full-stack application connecting job seekers with recruiters using an intelligent matching engine.

## 🚀 Key Features

### 1. Unified Authentication
- **One Login for All**: Simply enter your email and password. The system automatically detects if you are a **Recruiter** or an **Applicant**.
- **Secure**: Passwords are hashed and sessions are managed via JWT.

### 2. Recruiter Dashboard (For Companies)
- **Post Jobs**: Create job listings with detailed requirements:
    - Job Title & Description
    - **Company Name**
    - **Minimum CGPA Requirement**
    - Required Skills & Experience
- **Manage Listings**: View all your active job posts.

### 3. Student Dashboard (For Applicants)
- **Resume Analysis**: Upload your PDF resume. The system extracts:
    - Skills (e.g., Python, React)
    - Experience (Years)
    - Education
- **Job Board**: View available jobs with Company Name and Requirements.
- **Smart Matching**: Click "Calculate Match" on any job to see your fit score.

### 4. Matching Engine 🧠
The AI scoring logic is transparent and fair:
- **70% Skills Match**: Based on the overlap between your resume skills and the job's required skills.
- **30% Experience Match**: Based on your years of experience vs the requirement.
- **Match Report**: Detailed breakdown of **Matched Skills**, **Missing Skills**, and suggested courses for upskilling.

## 🛠️ Technology Stack
- **Frontend**: HTML5, Vanilla CSS, JavaScript (No complex frameworks).
- **Backend**: Python (FastAPI).
- **Database**: MongoDB (Stores Users, Jobs, Resumes, Matches).

## ⚡ How to Run
1. **Backend**:
   ```bash
   cd backend
   python -m uvicorn app.main:app --reload
   ```
2. **Frontend**:
   Open `frontend/index.html` in your browser (or use Live Server).
