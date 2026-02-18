from fastapi import APIRouter, HTTPException, status, Depends
from app.models.user import UserCreate, UserResponse, UserInDB
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.database import get_collection
from uuid import uuid4

router = APIRouter()
users_collection = get_collection("users")

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    # Check if user exists
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid4())
    user_dict = {
        "_id": user_id,
        "email": user.email,
        "hashed_password": get_password_hash(user.password),
        "role": user.role
    }
    
    await users_collection.insert_one(user_dict)
    return {"id": user_id, "email": user.email, "role": user.role}

@router.post("/login")
async def login(user_creds: UserCreate): # Using same schema for simplicity in hackathon
    user = await users_collection.find_one({"email": user_creds.email})
    if not user or not verify_password(user_creds.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    access_token = create_access_token(data={"sub": user["_id"], "role": user["role"]})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "role": user["role"]
    }
