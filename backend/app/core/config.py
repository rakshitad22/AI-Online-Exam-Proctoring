import os
from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Online Exam Proctoring System"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "ai-proctoring-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "ai_proctoring_db"
    
    # Proctoring & AI Threshold Settings
    FRAME_INTERVAL: float = 3.0 # Frame sampling interval in seconds
    CONFIDENCE_THRESHOLD: float = 0.50
    PHONE_CONFIDENCE_THRESHOLD: float = 0.60
    CONSECUTIVE_FRAMES_REQUIRED: int = 2
    HEAD_MOVEMENT_THRESHOLD: float = 0.22
    TALKING_THRESHOLD: float = 0.35
    MAX_WARNINGS: int = 3
    
    # Web Audio RMS Settings
    AUDIO_THRESHOLD_RMS: float = 0.25
    AUDIO_CONFIRMATION_SECS: float = 1.5
    
    # Risk Score Weights
    WEIGHT_HEAD_MOVEMENT: int = 5
    WEIGHT_TALKING: int = 10
    WEIGHT_BACKGROUND_NOISE: int = 15
    WEIGHT_EXTERNAL_DEVICE: int = 25
    WEIGHT_MULTIPLE_PERSONS: int = 30
    
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8008",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8008",
    ]

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
