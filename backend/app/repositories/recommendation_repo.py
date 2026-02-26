from __future__ import annotations

from typing import Optional, Sequence

from sqlmodel import Session, select
from sqlalchemy import desc

from app.models.recommendation import RecommendationRun, Recommendation


def create_run(
    session: Session,
    profile_id: int,
    model_version: str,
    profile_signature: Optional[str] = None,
) -> RecommendationRun:
    run = RecommendationRun(
        profile_id=profile_id,
        model_version=model_version,
        profile_signature=profile_signature,
    )
    session.add(run)
    session.commit()
    session.refresh(run)
    return run


def bulk_insert_recommendations(session: Session, recs: Sequence[Recommendation]) -> None:
    if not recs:
        return
    session.add_all(list(recs))
    session.commit()


def get_run_recommendations(session: Session, run_id: int) -> list[Recommendation]:
    return list(
        session.exec(select(Recommendation).where(Recommendation.run_id == run_id)).all()
    )


def get_latest_run_for_profile_signature(
    session: Session,
    profile_id: int,
    signature: str,
    model_version: str = "v2",
) -> Optional[RecommendationRun]:
    q = (
        select(RecommendationRun)
        .where(RecommendationRun.profile_id == profile_id)
        .where(RecommendationRun.model_version == model_version)
        .where(RecommendationRun.profile_signature == signature)
        .order_by(desc(RecommendationRun.id))
        .limit(1)
    )
    return session.exec(q).first()