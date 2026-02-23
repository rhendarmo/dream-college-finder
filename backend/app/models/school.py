from typing import Optional
from sqlmodel import SQLModel, Field


class School(SQLModel, table=True):
    __tablename__ = "schools"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    state: Optional[str] = None

    # Lightweight fields for V1 scoring
    acceptance_rate: Optional[float] = None  # 0-1
    avg_sat: Optional[int] = None
    avg_gpa: Optional[float] = None

    # For later: program matching / RAG retrieval
    tags: Optional[str] = None  # comma-separated keywords (e.g. "business,analytics,stem")