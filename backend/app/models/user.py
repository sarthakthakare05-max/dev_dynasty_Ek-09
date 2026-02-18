from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from bson import ObjectId

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str = Field(..., pattern="^(applicant|recruiter)$")

class UserInDB(BaseModel):
    id: str = Field(alias="_id")
    email: str
    hashed_password: str
    role: str

class UserResponse(BaseModel):
    id: str
    email: str
    role: str
