from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.db.session import get_session
from app.models.school import School
from app.models.profile import Profile
from app.repositories.school_repo import list_schools, get_school
from app.dependencies.auth_deps import get_current_user

# Use the SAME engine as recommendations (v2)
from app.services.recommendation_engine_v2 import compute_fit


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
def explain_school_fit(
    school_id: int,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    school = get_school(session, school_id)
    if not school:
        raise HTTPException(status_code=404, detail="School not found")

    profile = session.exec(select(Profile).where(Profile.user_id == current_user.id)).first()
    if not profile:
        raise HTTPException(
            status_code=400,
            detail="No profile found. Please complete your profile first.",
        )

    prob, category, reason, breakdown = compute_fit(session, profile, school)

    # breakdown might be a dataclass OR a dict OR None
    if breakdown is None:
        breakdown_payload = None
    elif hasattr(breakdown, "__dict__"):
        breakdown_payload = breakdown.__dict__
    else:
        breakdown_payload = breakdown  # assume it's already dict-like

    return {
        "school_id": school_id,
        "explanation": reason,
        "probability": prob,
        "category": category,
        "breakdown": breakdown_payload,
    }