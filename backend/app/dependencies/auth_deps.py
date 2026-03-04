from fastapi import Depends, HTTPException, Request
from sqlmodel import Session

from app.db.session import get_session
from app.core.security import decode_token
from app.repositories.user_repo import get_user


def get_current_user(request: Request, session: Session = Depends(get_session)):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user_id = int(payload["sub"])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = get_user(session, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user