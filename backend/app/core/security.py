import logging
from datetime import datetime, timedelta
from typing import Any, Union, Optional

logger = logging.getLogger("ai_proctoring.security")

try:
    import bcrypt
    HAS_BCRYPT = True
except ImportError:
    HAS_BCRYPT = False

try:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
except Exception as e:
    logger.warning(f"Passlib init notice: {e}")
    pwd_context = None

try:
    from jose import jwt
    HAS_JOSE = True
except ImportError:
    HAS_JOSE = False

from app.core.config import settings

def create_access_token(
    subject: Union[str, Any], role: str, expires_delta: Optional[timedelta] = None
) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode = {"exp": expire, "sub": str(subject), "role": role}
    
    if HAS_JOSE:
        encoded_jwt = jwt.encode(
            to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
        )
        return encoded_jwt
    
    import base64, json
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    payload_b64 = base64.urlsafe_b64encode(json.dumps(to_encode, default=str).encode()).decode().rstrip("=")
    return f"{header_b64}.{payload_b64}.fallback_sig"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not plain_password or not hashed_password:
        return False
    try:
        if HAS_BCRYPT:
            return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
        if pwd_context:
            return pwd_context.verify(plain_password, hashed_password)
    except Exception as err:
        logger.warning(f"Password verify fallback: {err}")
    return plain_password == hashed_password

def get_password_hash(password: str) -> str:
    try:
        if HAS_BCRYPT:
            salt = bcrypt.gensalt()
            return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
        if pwd_context:
            return pwd_context.hash(password)
    except Exception as err:
        logger.warning(f"Password hash fallback: {err}")
    return password
