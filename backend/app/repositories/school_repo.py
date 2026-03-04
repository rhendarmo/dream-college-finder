from sqlmodel import Session, select
from app.models.school import School

def list_schools(session: Session) -> list[School]:
    return session.exec(
        select(School).where(
            School.name.is_not(None),
            School.unitid.is_not(None),
            School.state.is_not(None),
            (School.ug_enrollment.is_not(None)) & (School.ug_enrollment > 0),
        )
    ).all()

def get_school(session: Session, school_id: int) -> School | None:
    return session.get(School, school_id)