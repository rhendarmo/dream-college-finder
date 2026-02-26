from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.db.session import get_session
from app.dependencies.auth_deps import get_current_user
from app.models.profile import Profile, ProfileCreate

router = APIRouter(prefix="/profiles", tags=["profiles"])


def _get_my_profile(session: Session, user_id: int) -> Profile | None:
    return session.exec(select(Profile).where(Profile.user_id == user_id)).first()


@router.get("/me", response_model=Profile)
def get_profile_me(session: Session = Depends(get_session), current_user=Depends(get_current_user)):
    profile = _get_my_profile(session, current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.put("/me", response_model=Profile)
def upsert_profile_me(payload: ProfileCreate, session: Session = Depends(get_session), current_user=Depends(get_current_user)):
    profile = _get_my_profile(session, current_user.id)

    if not profile:
        profile = Profile(user_id=current_user.id, **payload.model_dump())
        session.add(profile)
        session.commit()
        session.refresh(profile)
        return profile

    # Update existing
    data = payload.model_dump()
    for k, v in data.items():
        setattr(profile, k, v)

    session.add(profile)
    session.commit()
    session.refresh(profile)
    return profile