import sys
import logging
from pathlib import Path
from urllib.parse import parse_qs
from fastapi import FastAPI
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

# Pure ASGI Middleware to update scope["path"] BEFORE Starlette route matching
class VercelPathRewriteMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            query_string = scope.get("query_string", b"").decode("utf-8")
            params = parse_qs(query_string)
            if "__path__" in params and params["__path__"]:
                raw_target = params["__path__"][0]
                scope["path"] = raw_target if raw_target.startswith("/") else f"/{raw_target}"
        await self.app(scope, receive, send)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url="/api/v1/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add Vercel ASGI rewrite middleware
app.add_middleware(VercelPathRewriteMiddleware)

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
