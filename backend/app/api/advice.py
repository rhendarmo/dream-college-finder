from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select

from app.db.session import get_session
from app.dependencies.auth_deps import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.models.resume import Resume, AdviceRun
from app.models.school import School
from app.models.recommendation import Recommendation
from app.repositories.recommendation_repo import get_latest_run_for_profile_signature, get_run_recommendations
from app.services.signatures import profile_signature, resume_signature
from app.services.advice_module import generate_advice

router = APIRouter(prefix="/advice", tags=["advice"])


class AdviceResponse(BaseModel):
    cached: bool
    advice: dict


@router.post("/run", response_model=AdviceResponse)
def run_advice(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    profile = session.exec(select(Profile).where(Profile.user_id == current_user.id)).first()
    if not profile:
        raise HTTPException(status_code=400, detail="No profile found. Complete your profile first.")

    resume = session.exec(select(Resume).where(Resume.user_id == current_user.id)).first()
    if not resume or not resume.parsed:
        raise HTTPException(status_code=400, detail="No resume found. Upload your resume first.")

    p_sig = profile_signature(profile)
    r_sig = resume_signature(resume.text)

    # Check cache
    cached = session.exec(
        select(AdviceRun)
        .where(
            AdviceRun.user_id == current_user.id,
            AdviceRun.profile_signature == p_sig,
            AdviceRun.resume_signature == r_sig,
        )
        .order_by(AdviceRun.id.desc())
    ).first()

    if cached:
        return {"cached": True, "advice": cached.advice_json}

    # Get latest recommendations (v2) for this profile signature if you have it
    # If you already cache recommendations by signature, reuse them here.
    # Otherwise, fallback: pick the most recent run.
    # We'll assume your recommendation_runs table already supports signature caching (from earlier).
    run = get_latest_run_for_profile_signature(session, profile_id=profile.id, signature=p_sig, model_version="v2")
    if not run:
        raise HTTPException(status_code=400, detail="No recommendations found. Open dashboard first to generate them.")

    recs: list[Recommendation] = get_run_recommendations(session, run.id)
    if not recs:
        raise HTTPException(status_code=400, detail="No recommendation rows found for latest run.")

    # Build category -> school cards minimal
    schools_by_category: dict[str, list[dict]] = {"Reach": [], "Target": [], "Safety": []}
    for r in recs:
        sch = session.exec(select(School).where(School.id == r.school_id)).first()
        if not sch:
            continue
        schools_by_category[r.category].append({
            "name": sch.name,
            "state": sch.state,
            "admission_rate": sch.admission_rate,
            "sat_avg": sch.sat_avg,
            "act_mid": sch.act_mid,
            "tuition_in": sch.tuition_in,
            "tuition_out": sch.tuition_out,
            "grad_rate_4yr": sch.grad_rate_4yr,
            "median_earnings_10yr": sch.median_earnings_10yr,
        })

    advice = generate_advice(
        profile={
            "gpa": profile.gpa,
            "sat": profile.sat,
            "act": profile.act,
            "intended_major": profile.intended_major,
            "location_preference": profile.location_preference,
            "notes": profile.notes,
        },
        resume_parsed=resume.parsed,
        schools_by_category=schools_by_category,
    )

    run_row = AdviceRun(
        user_id=current_user.id,
        profile_signature=p_sig,
        resume_signature=r_sig,
        advice_json=advice,
    )
    session.add(run_row)
    session.commit()

    return {"cached": False, "advice": advice}