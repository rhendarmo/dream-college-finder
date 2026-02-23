from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.db.session import get_session
from app.repositories.school_repo import list_schools
from app.models.school import School

router = APIRouter(prefix="/schools", tags=["schools"])


@router.get("", response_model=list[School])
def get_schools(session: Session = Depends(get_session)):
    return list_schools(session)