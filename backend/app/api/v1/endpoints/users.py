from typing import List
from fastapi import APIRouter, HTTPException, Depends
from app.core.database import get_database

router = APIRouter()

@router.get("/", response_model=List[dict])
async def list_students():
    db = get_database()
    users = []
    cursor = db.users.find({"role": "student"})
    async for u in cursor:
        u["_id"] = str(u["_id"])
        u["id"] = u["_id"]
        u.pop("hashed_password", None)
        users.append(u)
    return users
