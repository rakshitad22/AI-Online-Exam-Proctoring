from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, exams, proctoring, reports

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users & Students"])
api_router.include_router(exams.router, prefix="/exams", tags=["Exams Management"])
api_router.include_router(proctoring.router, prefix="/proctoring", tags=["AI Real-time Proctoring"])
api_router.include_router(reports.router, prefix="/reports", tags=["Exam Reports & Analytics"])
