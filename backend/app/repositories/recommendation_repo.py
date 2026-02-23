from sqlmodel import Session, select
from app.models.recommendation import RecommendationRun, Recommendation


def create_run(session: Session, profile_id: int, model_version: str = "v1") -> RecommendationRun:
    run = RecommendationRun(profile_id=profile_id, model_version=model_version)
    session.add(run)
    session.commit()
    session.refresh(run)
    return run


def bulk_insert_recommendations(session: Session, recs: list[Recommendation]) -> None:
    session.add_all(recs)
    session.commit()


def get_run_recommendations(session: Session, run_id: int) -> list[Recommendation]:
    return session.exec(select(Recommendation).where(Recommendation.run_id == run_id).order_by(Recommendation.score.desc())).all()