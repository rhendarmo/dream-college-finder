from typing import Optional
from sqlmodel import SQLModel, Field


class RecommendationRun(SQLModel, table=True):
    __tablename__ = "recommendation_runs"

    id: Optional[int] = Field(default=None, primary_key=True)
    profile_id: int
    model_version: str = "v1"
    created_at: Optional[str] = None  # keep simple for now
    profile_signature: Optional[str] = Field(default=None, index=True)


class Recommendation(SQLModel, table=True):
    __tablename__ = "recommendations"

    id: Optional[int] = Field(default=None, primary_key=True)
    run_id: int
    school_id: int

    category: str  # "reach" | "target" | "safety"
    probability: float  # 0-1
    score: float  # internal ranking score
    reason: str