from typing import List, Tuple

def calculate_match_score(
    applicant_skills: List[str], 
    applicant_exp: int, 
    job_skills: List[str], 
    required_exp: int
) -> Tuple[float, List[str], List[str]]:
    """
    Logic:
    - 70% Skills matching (Intersection count / Required count)
    - 30% Experience matching (Applicant Exp / Required Exp, max 1.0)
    """
    
    # 1. Normalize
    app_skills_set = {s.lower().strip() for s in applicant_skills}
    job_skills_set = {s.lower().strip() for s in job_skills}
    
    # 2. Skill Intersection
    matched_skills = list(app_skills_set.intersection(job_skills_set))
    missing_skills = list(job_skills_set - app_skills_set)
    
    if not job_skills_set:
        skill_score = 1.0
    else:
        skill_score = len(matched_skills) / len(job_skills_set)
        
    # 3. Experience Score
    if required_exp <= 0:
        exp_score = 1.0
    else:
        exp_score = min(applicant_exp / required_exp, 1.0)
        
    # 4. Final Weighted Score
    final_score = (0.7 * skill_score + 0.3 * exp_score) * 100
    
    return round(final_score, 2), matched_skills, missing_skills
