import re
import time
import secrets
import hashlib
from passlib.context import CryptContext
from jose import jwt
from fastapi import HTTPException
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

PASSWORD_REGEX = re.compile(r"^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$")


def validate_password(password: str) -> None:
    """
    Requirements:
    - Min length 8
    - At least 1 uppercase letter
    - At least 1 number
    - At least 1 symbol
    """
    if not PASSWORD_REGEX.match(password):
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters and include 1 uppercase letter, 1 number, and 1 symbol.",
        )

def hash_password(password: str) -> str:
    if len(password.encode("utf-8")) > 72:
        raise ValueError("Password too long (max 72 bytes). Use a shorter password.")
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def create_access_token(user_id: int) -> str:
    now = int(time.time())
    exp = now + settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    payload = {"sub": str(user_id), "type": "access", "iat": now, "exp": exp}
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm="HS256")


def create_refresh_token(user_id: int) -> str:
    now = int(time.time())
    exp = now + settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600
    payload = {"sub": str(user_id), "type": "refresh", "iat": now, "exp": exp}
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm="HS256")


def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])


def generate_email_token() -> str:
    # Raw token never stored in DB
    return secrets.token_urlsafe(32)


def hash_email_token(token: str) -> str:
    # Store hash of token
    return hashlib.sha256(token.encode("utf-8")).hexdigest()