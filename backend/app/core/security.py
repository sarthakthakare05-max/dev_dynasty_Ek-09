from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

# Fallback to pbkdf2_sha256 if bcrypt fails (common on Windows without C++ build tools)
pwd_context = CryptContext(schemes=["bcrypt", "pbkdf2_sha256"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    try:
        # Debugging: Print headers of hash to see scheme
        # print(f"DEBUG: Verifying hash: {hashed_password[:20]}...") 
        result = pwd_context.verify(plain_password, hashed_password)
        if not result:
            print(f"WARN: Password verification returned False for hash: {hashed_password[:15]}...")
        return result
    except (ValueError, Exception) as e:
        print(f"WARN: Password verification failed with error: {e}")
        return False

def get_password_hash(password):
    try:
        return pwd_context.hash(password)
    except Exception as e:
        print(f"ERROR: Hashing failed with bcrypt, trying fallback. Error: {e}")
        # Fallback manual hash if context fails completely (unlikely with pbkdf2)
        return pwd_context.hash(password, scheme="pbkdf2_sha256")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
