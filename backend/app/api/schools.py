from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.db.session import get_session
from app.models.school import School
from app.models.profile import Profile
from app.repositories.school_repo import list_schools, get_school
from app.repositories.profile_repo import get_profile
from app.services.explain_service import explain_fit_v1
from app.dependencies.auth_deps import get_current_user


router = APIRouter(prefix="/schools", tags=["schools"])


@router.get("", response_model=list[School])
def get_schools(session: Session = Depends(get_session)):
    return list_schools(session)


@router.get("/{school_id}", response_model=School)
def get_school_by_id(school_id: int, session: Session = Depends(get_session)):
    school = get_school(session, school_id)
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    return school


@router.get("/{school_id}/explain")
def explain_school_fit(school_id: int, session: Session = Depends(get_session), current_user=Depends(get_current_user)):
    school = get_school(session, school_id)
    if not school:
        raise HTTPException(status_code=404, detail="School not found")

    profile = session.exec(select(Profile).where(Profile.user_id == current_user.id)).first()
    if not profile:
        raise HTTPException(status_code=400, detail="No profile found. Please complete your profile first.")

    explanation = explain_fit_v1(profile, school)
    return {"school_id": school_id, "explanation": explanation}