import logging
from typing import List
from bson import ObjectId
from datetime import datetime
from fastapi import APIRouter
from app.core.database import get_database

logger = logging.getLogger("ai_proctoring.users")

def to_jsonable_dict(doc: dict) -> dict:
    if not isinstance(doc, dict):
        return doc
    clean = {}
    for k, v in doc.items():
        if isinstance(v, ObjectId):
            clean[k] = str(v)
        elif isinstance(v, datetime):
            clean[k] = v.isoformat()
        elif isinstance(v, list):
            clean[k] = [to_jsonable_dict(item) if isinstance(item, dict) else (str(item) if isinstance(item, ObjectId) else item) for item in v]
        elif isinstance(v, dict):
            clean[k] = to_jsonable_dict(v)
        else:
            clean[k] = v
    if "_id" in clean:
        clean["_id"] = str(clean["_id"])
        clean["id"] = clean["_id"]
    return clean

router = APIRouter()

@router.get("/", response_model=List[dict])
@router.get("", response_model=List[dict])
async def list_students():
    db = get_database()
    if db is None:
        return []
    try:
        users = []
        cursor = db.users.find({"role": "student"})
        async for u in cursor:
            clean_u = to_jsonable_dict(u)
            clean_u.pop("hashed_password", None)
            users.append(clean_u)
        return users
    except Exception as err:
        logger.warning(f"list_students error: {err}")
        return []
