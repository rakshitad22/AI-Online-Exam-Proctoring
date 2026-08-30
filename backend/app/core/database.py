import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

logger = logging.getLogger("ai_proctoring.db")

class Database:
    client: AsyncIOMotorClient = None
    db = None

db = Database()

async def connect_to_mongo():
    try:
        if db.db is None:
            logger.info(f"Connecting to MongoDB at {settings.MONGODB_URL}...")
            db.client = AsyncIOMotorClient(settings.MONGODB_URL, serverSelectionTimeoutMS=5000)
            db.db = db.client[settings.DATABASE_NAME]
            logger.info(f"Connected to database: {settings.DATABASE_NAME}")
    except Exception as e:
        logger.error(f"MongoDB connection warning on startup: {e}")

async def close_mongo_connection():
    if db.client:
        try:
            logger.info("Closing MongoDB connection...")
            db.client.close()
            logger.info("MongoDB connection closed.")
        except Exception as e:
            logger.error(f"Error closing MongoDB connection: {e}")

def get_database():
    if db.db is None:
        try:
            logger.info(f"Lazy connecting to MongoDB at {settings.MONGODB_URL}...")
            db.client = AsyncIOMotorClient(settings.MONGODB_URL, serverSelectionTimeoutMS=5000)
            db.db = db.client[settings.DATABASE_NAME]
        except Exception as e:
            logger.error(f"Lazy MongoDB connection error: {e}")
            return None
    return db.db
