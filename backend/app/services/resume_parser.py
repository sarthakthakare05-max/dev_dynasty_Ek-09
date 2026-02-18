from pypdf import PdfReader
from typing import List, Tuple
import re

# Simple keyword list for MVP. In a real app, this would be a comprehensive database.
SKILLS_DB = [
    "python", "java", "javascript", "typescript", "html", "css", "sql", "nosql",
    "mongodb", "postgresql", "react", "angular", "vue", "node.js", "express",
    "flask", "django", "fastapi", "docker", "kubernetes", "aws", "azure", "git",
    "machine learning", "deep learning", "nlp", "pandas", "numpy", "scikit-learn",
    "tensorflow", "pytorch", "c++", "c#", "go", "rust", "php", "ruby", "swift"
]

def extract_resume_data(file_path: str) -> Tuple[List[str], int, str, float, str]:
    """
    Extracts skills, experience, raw text, CGPA, and Education from a PDF resume.
    Returns: (skills, experience_years, raw_text, cgpa, education)
    """
    try:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        
        text_lower = text.lower()
        
        # 1. Extract Skills
        found_skills = []
        for skill in SKILLS_DB:
            # Match whole words only to avoid false positives (e.g., "go" in "good")
            if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
                found_skills.append(skill.title()) # Capitalize for display
                
        # 2. Extract Experience (Heuristic)
        # Look for patterns like "5 years experience", "experience: 5 years", etc.
        # This is very basic and prone to errors, but better than static mock.
        exp_years = 0
        
        # Try to find "X years" patterns
        years_matches = re.findall(r'(\d+)\+?\s*years?', text_lower)
        if years_matches:
            # Take the max number found, assuming it might be the total experience
            # Capping at 20 to avoid outliers like "2023 years" (unlikely but possible with bad parsing)
            valid_years = [int(y) for y in years_matches if int(y) < 40]
            if valid_years:
                exp_years = max(valid_years)
        
    # 3. Extract CGPA (Regex)
        # Patterns: "CGPA: 9.5", "CGPA 9.5", "8.5/10", "3.8/4.0"
        cgpa = None
        cgpa_match = re.search(r'(?:CGPA|SGPA)\s*[:=-]?\s*(\d+(\.\d+)?)', text, re.IGNORECASE)
        if cgpa_match:
            try:
                val = float(cgpa_match.group(1))
                if val <= 10.0: # Sanity check for 10-point scale
                    cgpa = val
            except:
                pass
        
        # Fallback: Look for "X.X / 10" pattern
        if not cgpa:
            score_match = re.search(r'(\d+(\.\d+)?)\s*/\s*(?:10|4\.0)', text)
            if score_match:
                try:
                    val = float(score_match.group(1))
                    cgpa = val
                except:
                    pass

        # 4. Extract Education (Keywords)
        # Simple keyword matching for common degrees
        education_keywords = [
            "B.Tech", "B.E.", "M.Tech", "M.E.", "Bachelor", "Master", 
            "B.Sc", "M.Sc", "Ph.D", "Diploma", "Computer Science", 
            "Information Technology"
        ]
        education = []
        for kw in education_keywords:
            if re.search(r'\b' + re.escape(kw) + r'\b', text, re.IGNORECASE):
                education.append(kw)
        
        # Format education string
        education_str = ", ".join(education) if education else None

        return found_skills, exp_years, text, cgpa, education_str
        
    except Exception as e:
        print(f"Error parsing PDF: {e}")
        return [], 0, "", None, None
