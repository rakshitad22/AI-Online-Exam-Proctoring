import os
from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Online Exam Proctoring System"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "ai-proctoring-super-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    
    # Priority order for MongoDB Connection: MONGODB_URI (Vercel/Atlas) -> MONGODB_URL -> Localhost
    MONGODB_URL: str = os.getenv("MONGODB_URI") or os.getenv("MONGODB_URL") or "mongodb://localhost:27017"
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "ai_proctoring_db")
    
    # Proctoring & AI Threshold Settings
    FRAME_INTERVAL: float = float(os.getenv("FRAME_INTERVAL", "3.0"))
    CONFIDENCE_THRESHOLD: float = float(os.getenv("CONFIDENCE_THRESHOLD", "0.50"))
    PHONE_CONFIDENCE_THRESHOLD: float = float(os.getenv("PHONE_CONFIDENCE_THRESHOLD", "0.60"))
    CONSECUTIVE_FRAMES_REQUIRED: int = int(os.getenv("CONSECUTIVE_FRAMES_REQUIRED", "2"))
    HEAD_MOVEMENT_THRESHOLD: float = float(os.getenv("HEAD_MOVEMENT_THRESHOLD", "0.22"))
    TALKING_THRESHOLD: float = float(os.getenv("TALKING_THRESHOLD", "0.35"))
    MAX_WARNINGS: int = int(os.getenv("MAX_WARNINGS", "3"))
    
    # Web Audio RMS Settings
    AUDIO_THRESHOLD_RMS: float = float(os.getenv("AUDIO_THRESHOLD_RMS", "0.25"))
    AUDIO_CONFIRMATION_SECS: float = float(os.getenv("AUDIO_CONFIRMATION_SECS", "1.5"))
    
    # Risk Score Weights
    WEIGHT_HEAD_MOVEMENT: int = int(os.getenv("WEIGHT_HEAD_MOVEMENT", "5"))
    WEIGHT_TALKING: int = int(os.getenv("WEIGHT_TALKING", "10"))
    WEIGHT_BACKGROUND_NOISE: int = int(os.getenv("WEIGHT_BACKGROUND_NOISE", "15"))
    WEIGHT_EXTERNAL_DEVICE: int = int(os.getenv("WEIGHT_EXTERNAL_DEVICE", "25"))
    WEIGHT_MULTIPLE_PERSONS: int = int(os.getenv("WEIGHT_MULTIPLE_PERSONS", "30"))
    
    BACKEND_CORS_ORIGINS: List[str] = [
        "https://ai-online-exam-proctoring.vercel.app",
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
