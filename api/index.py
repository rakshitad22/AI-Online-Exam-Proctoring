import sys
import logging
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT_DIR / "backend"

if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
if BACKEND_DIR.exists() and str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

try:
    from backend.app.main import app
except Exception as err:
    try:
        from app.main import app
    except Exception as err2:
        logging.exception(f"Failed to import app.main on Vercel root handler: {err2}")
        from fastapi import FastAPI
        app = FastAPI(title="AI Proctoring System - Serverless Gateway")

        @app.get("/")
        @app.get("/docs")
        @app.get("/{full_path:path}")
        def serverless_fallback(full_path: str = ""):
            return {
                "project": "AI Online Exam Proctoring System",
                "status": "error",
                "error_details": f"{str(err)} | {str(err2)}",
                "message": "Serverless Function startup notice."
            }
