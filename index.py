import sys
import logging
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html

CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR / "backend"

if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))
if BACKEND_DIR.exists() and str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

try:
    from backend.app.core.config import settings
    from backend.app.api.v1.api import api_router
except ImportError:
    from app.core.config import settings
    from app.api.v1.api import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url="/api/v1/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

cors_origins = settings.BACKEND_CORS_ORIGINS or ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Health Check"])
@app.get("/api/index", tags=["Health Check"])
@app.get("/api/index.py", tags=["Health Check"])
def root():
    return {
        "project": settings.PROJECT_NAME,
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs",
        "message": "AI Proctoring API Active on Vercel Serverless."
    }

@app.get("/docs", include_in_schema=False)
@app.get("/api/index.py/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url="/api/v1/openapi.json",
        title=f"{settings.PROJECT_NAME} - Swagger UI"
    )

@app.get("/{full_path:path}", include_in_schema=False)
async def catch_all(full_path: str):
    clean_path = full_path.strip("/")
    if clean_path in ["", "api/index", "api/index.py", "index", "index.py"]:
        return {
            "project": settings.PROJECT_NAME,
            "status": "online",
            "version": "1.0.0",
            "docs": "/docs",
            "message": "AI Proctoring API Active on Vercel Serverless."
        }
    raise HTTPException(status_code=404, detail=f"Endpoint '/{full_path}' not found")
