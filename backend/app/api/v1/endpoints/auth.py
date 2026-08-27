from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.auth import LoginRequest, RegisterRequest, Token
from app.services.auth_service import register_user, authenticate_user

router = APIRouter()

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(req: RegisterRequest):
    return await register_user(req)

@router.post("/login", response_model=Token)
async def login(req: LoginRequest):
    return await authenticate_user(req)
