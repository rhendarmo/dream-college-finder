from sqlmodel import Session, select
from app.models.school import School

def list_schools(session: Session) -> list[School]:
    return session.exec(select(School)).all()

def get_school(session: Session, school_id: int) -> School | None:
    return session.get(School, school_id)