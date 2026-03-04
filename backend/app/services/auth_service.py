import time
from fastapi import HTTPException
from sqlmodel import Session

from app.core.config import settings
from app.core.security import (
    validate_password,
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    generate_email_token,
    hash_email_token,
)
from app.repositories.user_repo import get_user_by_email, create_user, get_user, set_email_verified
from app.repositories.email_verification_repo import create_verification_token, get_token_row, mark_used
from app.services.email_service import send_verification_email


def register_user(session: Session, email: str, password: str) -> None:
    email = email.lower().strip()
    if get_user_by_email(session, email):
        raise HTTPException(status_code=400, detail="Email already registered.")

    validate_password(password)
    user = create_user(session, email=email, password_hash=hash_password(password))

    # token valid for 24 hours
    raw_token = generate_email_token()
    token_hash = hash_email_token(raw_token)
    expires = int(time.time()) + 24 * 3600

    create_verification_token(session, user_id=user.id, token_hash=token_hash, expires_at_unix=expires)

    verify_url = f"{settings.FRONTEND_BASE_URL}/verify-email?token={raw_token}"
    send_verification_email(to_email=user.email, verify_url=verify_url)


def verify_email(session: Session, raw_token: str) -> None:
    token_hash = hash_email_token(raw_token)
    row = get_token_row(session, token_hash)
    if not row or row.used:
        raise HTTPException(status_code=400, detail="Invalid or used verification token.")

    if int(time.time()) > row.expires_at_unix:
        raise HTTPException(status_code=400, detail="Verification token expired.")

    user = get_user(session, row.user_id)
    if not user:
        raise HTTPException(status_code=400, detail="User not found.")

    set_email_verified(session, user)
    mark_used(session, row)


def login(session: Session, email: str, password: str) -> tuple[str, str, int]:
    user = get_user_by_email(session, email.lower().strip())
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    if not user.is_email_verified:
        raise HTTPException(status_code=403, detail="Email not verified. Please verify your email before logging in.")

    access = create_access_token(user.id)
    refresh = create_refresh_token(user.id)
    return access, refresh, user.id