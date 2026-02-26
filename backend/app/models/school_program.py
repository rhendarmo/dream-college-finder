from __future__ import annotations

from typing import Optional
from sqlmodel import SQLModel, Field


class SchoolProgram(SQLModel, table=True):
    __tablename__ = "school_programs"

    id: Optional[int] = Field(default=None, primary_key=True)

    # Link by unitid (Scorecard canonical id)
    school_unitid: int = Field(index=True)

    # e.g. "11" for Computer & Information Sciences, "52" for Business
    cip2: str = Field(index=True)

    # Share of degrees in this CIP group (0..1)
    share: float