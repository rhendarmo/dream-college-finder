from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional, Any

from sqlmodel import SQLModel, Field
from sqlalchemy import Column, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB


class Resume(SQLModel, table=True):
    __tablename__ = "resumes"

    id: Optional[int] = Field(default=None, primary_key=True)

    # 1 resume per user
    user_id: int = Field(
        index=True,
        sa_column_kwargs={"unique": True},
    )

    filename: str
    text: str  # extracted plain text

    parsed: Optional[dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSONB, nullable=True),
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), server_default=func.now(), nullable=False),
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False),
    )


class AdviceRun(SQLModel, table=True):
    __tablename__ = "advice_runs"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True)

    profile_signature: str = Field(index=True)
    resume_signature: str = Field(index=True)

    advice_json: dict[str, Any] = Field(
        sa_column=Column(JSONB, nullable=False)
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), server_default=func.now(), nullable=False),
    )