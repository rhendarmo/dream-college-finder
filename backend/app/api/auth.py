from fastapi import APIRouter, Depends, Response
from pydantic import BaseModel, EmailStr
from sqlmodel import Session

from app.db.session import get_session
from app.services.auth_service import register_user, verify_email, login
from app.dependencies.auth_deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/register")
def register(payload: RegisterRequest, session: Session = Depends(get_session)):
    register_user(session, payload.email, payload.password)
    return {"message": "Registered successfully. Please check your email to verify your account."}


@router.post("/verify-email")
def verify(payload: dict, session: Session = Depends(get_session)):
    token = payload.get("token")
    if not token:
        return {"detail": "Missing token"}
    verify_email(session, token)
    return {"message": "Email verified successfully. You can now log in."}


@router.post("/login")
def do_login(payload: LoginRequest, response: Response, session: Session = Depends(get_session)):
    access, refresh, user_id = login(session, payload.email, payload.password)

    # httpOnly cookies (secure in prod with HTTPS)
    response.set_cookie("access_token", access, httponly=True, samesite="lax")
    response.set_cookie("refresh_token", refresh, httponly=True, samesite="lax")

    return {"message": "Logged in", "user_id": user_id}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Logged out"}


@router.get("/me")
def me(current_user=Depends(get_current_user)):
    return {"id": current_user.id, "email": current_user.email}