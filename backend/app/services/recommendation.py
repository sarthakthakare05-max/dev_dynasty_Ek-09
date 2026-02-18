from typing import List, Dict

# Static dataset for hackathon
COURSE_DATABASE: Dict[str, List[str]] = {
    "python": ["Python for Everybody - Coursera", "Complete Python Bootcamp - Udemy"],
    "react": ["React - The Complete Guide - Udemy", "Meta Front-End Developer - Coursera"],
    "docker": ["Docker for Beginners - Udemy", "DevOps Foundations - Coursera"],
    "javascript": ["The Complete JavaScript Course - Udemy", "JavaScript Algorithms - FreeCodeCamp"],
    "sql": ["SQL for Data Science - Coursera", "The Ultimate MySQL Bootcamp - Udemy"],
    "aws": ["AWS Certified Cloud Practitioner - Udemy", "AWS Fundamentals - Coursera"],
    "fastapi": ["FastAPI - The Complete Course - Udemy", "Modern Python with FastAPI - TestDriven.io"],
    "node.js": ["The Complete Node.js Developer Course - Udemy"],
    "typescript": ["Understanding TypeScript - Udemy"],
    "mongodb": ["MongoDB - The Complete Guide - Udemy"],
}

def get_recommendations(missing_skills: List[str]) -> List[Dict]:
    recommendations = []
    for skill in missing_skills:
        skill_key = skill.lower().strip()
        if skill_key in COURSE_DATABASE:
            recommendations.append({
                "skill": skill,
                "courses": COURSE_DATABASE[skill_key]
            })
    return recommendations
