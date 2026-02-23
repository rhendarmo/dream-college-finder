from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.db.session import get_session
from app.models.school import School
from app.repositories.school_repo import list_schools, get_school
from app.repositories.profile_repo import get_profile
from app.services.explain_service import explain_fit_v1

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
def explain_school_fit(school_id: int, profile_id: int, session: Session = Depends(get_session)):
    school = get_school(session, school_id)
    if not school:
        raise HTTPException(status_code=404, detail="School not found")

    profile = get_profile(session, profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    explanation = explain_fit_v1(profile, school)
    return {"school_id": school_id, "profile_id": profile_id, "explanation": explanation}