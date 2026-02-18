from fastapi import APIRouter, HTTPException, status, Depends
from app.models.user import UserCreate, UserResponse, UserInDB, UserLogin
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.database import get_collection
from uuid import uuid4

router = APIRouter()
users_collection = get_collection("users")

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    print(f"DEBUG: Register attempt for {user.email} with role {user.role}") # Log attempt
    
    # Check if user exists
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    try:
        hashed_pw = get_password_hash(user.password)
    except ValueError as e:
        print(f"ERROR: Password hashing failed: {e}")
        raise HTTPException(status_code=400, detail="Password validation failed (possibly too long)")
    except Exception as e:
        print(f"ERROR: Unknown error during hashing: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

    user_id = str(uuid4())
    user_dict = {
        "_id": user_id,
        "email": user.email,
        "hashed_password": hashed_pw,
        "role": user.role
    }
    
    await users_collection.insert_one(user_dict)
    return {"id": user_id, "email": user.email, "role": user.role}

@router.post("/login")
async def login(user_creds: UserLogin): 
    user = await users_collection.find_one({"email": user_creds.email})
    if not user or not verify_password(user_creds.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    # Role check removed - we trust the DB's role for this user
    
    access_token = create_access_token(data={"sub": user["_id"], "role": user["role"]})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "role": user["role"]
    }
