import sys
from pathlib import Path

# Add backend directory and parent directory to sys.path so top-level packages (e.g., 'vision') are importable
BACKEND_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BACKEND_DIR.parent

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection
from app.api.v1.api import api_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai_proctoring.main")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="Full-stack AI Online Exam Proctoring and Abnormal Activity Detection System."
)

# Configure CORS for deployed Vercel frontend & localhost
cors_origins = settings.BACKEND_CORS_ORIGINS or ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    try:
        await connect_to_mongo()
    except Exception as err:
        logger.warning(f"Non-fatal DB startup notification: {err}")

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# Include API v1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Health check & root endpoint
@app.get("/", tags=["Health Check"])
async def root():
    return {
        "project": settings.PROJECT_NAME,
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs",
        "message": "AI Proctoring API Server Active."
    }

# Single-Link SPA Static Fallback (local unified mode)
FRONTEND_DIST = ROOT_DIR / "frontend" / "dist"
if FRONTEND_DIST.exists() and (FRONTEND_DIST / "index.html").exists():
    logger.info(f"Serving unified React frontend SPA from {FRONTEND_DIST}")
    if (FRONTEND_DIST / "assets").exists():
        app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            raise HTTPException(status_code=404, detail="API route not found")
        target_file = FRONTEND_DIST / full_path
        if target_file.is_file():
            return FileResponse(target_file)
        return FileResponse(FRONTEND_DIST / "index.html")
