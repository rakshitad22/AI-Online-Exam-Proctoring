from datetime import timedelta
from fastapi import HTTPException, status
from bson import ObjectId
from app.core.database import get_database
from app.core.security import get_password_hash, verify_password, create_access_token
from app.schemas.auth import LoginRequest, RegisterRequest, Token

async def register_user(req: RegisterRequest) -> dict:
    db = get_database()
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection unavailable. Please check MONGODB_URL environment variable."
        )
    existing_user = await db.users.find_one({"email": req.email.lower()})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address already registered."
        )
    
    hashed_pwd = get_password_hash(req.password)
    user_doc = {
        "email": req.email.lower(),
        "full_name": req.full_name,
        "hashed_password": hashed_pwd,
        "role": req.role.lower(),
        "student_id": req.student_id,
        "department": req.department,
        "is_active": True
    }
    
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    token = create_access_token(subject=user_id, role=req.role.lower())
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": req.role.lower(),
        "user_id": user_id,
        "full_name": req.full_name,
        "email": req.email.lower()
    }

async def authenticate_user(req: LoginRequest) -> dict:
    db = get_database()
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection unavailable. Please check MONGODB_URL environment variable."
        )
    user = await db.users.find_one({"email": req.email.lower()})
    if not user or not verify_password(req.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
    
    user_id = str(user["_id"])
    role = user.get("role", "student")
    token = create_access_token(subject=user_id, role=role)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": role,
        "user_id": user_id,
        "full_name": user.get("full_name", ""),
        "email": user["email"]
    }
