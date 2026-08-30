import sys
import logging
from pathlib import Path

# Ensure backend directory is in sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

try:
    from app.main import app
except Exception as err:
    logging.exception(f"Failed to import app.main on Vercel: {err}")
    from fastapi import FastAPI
    app = FastAPI(title="AI Proctoring System - Serverless Gateway")

    @app.get("/")
    @app.get("/docs")
    @app.get("/{full_path:path}")
    def serverless_fallback(full_path: str = ""):
        return {
            "project": "AI Online Exam Proctoring System",
            "status": "error",
            "error_details": str(err),
            "message": "Serverless Function startup notice."
        }
