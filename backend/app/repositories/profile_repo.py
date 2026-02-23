from sqlmodel import Session
from app.models.profile import Profile


def get_profile(session: Session, profile_id: int) -> Profile | None:
    return session.get(Profile, profile_id)