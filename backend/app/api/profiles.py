from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.db.session import get_session
from app.models.profile import Profile, ProfileCreate
from app.dependencies.auth_deps import get_current_user

router = APIRouter(prefix="/profiles", tags=["profiles"])

@router.post("", response_model=Profile)
def create_profile(payload: ProfileCreate, session: Session = Depends(get_session), current_user=Depends(get_current_user)):
    profile = Profile(user_id=current_user.id, **payload.model_dump())
    session.add(profile)
    session.commit()
    session.refresh(profile)
    return profile


@router.get("", response_model=list[Profile])
def list_profiles(session: Session = Depends(get_session), current_user=Depends(get_current_user)):
    return session.exec(
        select(Profile).where(Profile.user_id == current_user.id).order_by(Profile.id.desc())
    ).all()


@router.get("/{profile_id}", response_model=Profile)
def get_profile(profile_id: int, session: Session = Depends(get_session), current_user=Depends(get_current_user)):
    profile = session.get(Profile, profile_id)
    if not profile or profile.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile