from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select

from app.db.session import get_session
from app.dependencies.auth_deps import get_current_user
from app.models.profile import Profile
from app.models.user import User
from app.models.recommendation import Recommendation
from app.repositories.school_repo import list_schools
from app.repositories.recommendation_repo import (
    create_run,
    bulk_insert_recommendations,
    get_run_recommendations,
)
from app.services.recommendation_service import rank_schools_v1, rank_schools_v2, rank_schools_v2_balanced
from app.db import session

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


class RunRequest(BaseModel):
    top_k: int = 10


class RunResponseItem(BaseModel):
    school_id: int
    school_name: str
    category: str
    probability: float
    score: float
    reason: str


class RunResponse(BaseModel):
    run_id: int
    results: list[RunResponseItem]


@router.post("/run", response_model=RunResponse)
def run_recommendations(
    payload: RunRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    # Always use the current user's single profile
    profile = session.exec(
        select(Profile).where(Profile.user_id == current_user.id)
    ).first()

    if not profile:
        raise HTTPException(
            status_code=400,
            detail="No profile found. Please complete your profile first.",
        )

    schools = list_schools(session)
    if not schools:
        raise HTTPException(
            status_code=400,
            detail="No schools available. Seed schools first.",
        )

    ranked = rank_schools_v2_balanced(session, profile, schools, top_k=payload.top_k)
    run = create_run(session, profile_id=profile.id, model_version="v2")

    rec_rows: list[Recommendation] = []
    response_items: list[RunResponseItem] = []

    for r in ranked:
        rec_rows.append(
            Recommendation(
                run_id=run.id,
                school_id=r.school.id,
                category=r.category,
                probability=r.probability,
                score=r.score,
                reason=r.reason,
            )
        )
        response_items.append(
            RunResponseItem(
                school_id=r.school.id,
                school_name=r.school.name,
                category=r.category,
                probability=r.probability,
                score=r.score,
                reason=r.reason,
            )
        )

    bulk_insert_recommendations(session, rec_rows)
    return RunResponse(run_id=run.id, results=response_items)


@router.get("/run/{run_id}", response_model=list[Recommendation])
def get_recommendations(run_id: int, session: Session = Depends(get_session)):
    return get_run_recommendations(session, run_id)