import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "Resume Matcher AI"
    PROJECT_VERSION: str = "1.0.0"
    
    # Database
    MONGO_URL: str = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    DB_NAME: str = os.getenv("DB_NAME", "resume_matcher_db")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super_secret_key_for_hackathon_only")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

settings = Settings()
