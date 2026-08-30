import sys
import logging
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

# Ensure root and backend directories are in sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT_DIR / "backend"

if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
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

# Middleware to unwrap Vercel path rewrites accurately
@app.middleware("http")
async def fix_vercel_path_middleware(request: Request, call_next):
    raw_path = request.url.path
    if raw_path.startswith("/api/index.py"):
        suffix = raw_path[len("/api/index.py"):]
        request.scope["path"] = suffix if suffix else "/"
    elif raw_path.startswith("/api/index"):
        suffix = raw_path[len("/api/index"):]
        request.scope["path"] = suffix if suffix else "/"
    return await call_next(request)

# Configure CORS
cors_origins = settings.BACKEND_CORS_ORIGINS or ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Health Check"])
def root():
    return {
        "project": settings.PROJECT_NAME,
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs",
        "message": "AI Proctoring API Active on Vercel Serverless."
    }
