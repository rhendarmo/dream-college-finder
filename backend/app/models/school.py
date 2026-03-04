from __future__ import annotations

from typing import Optional, Any
from sqlmodel import SQLModel, Field
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB


class School(SQLModel, table=True):
    __tablename__ = "schools"

    id: Optional[int] = Field(default=None, primary_key=True)

    # Scorecard canonical id
    unitid: int = Field(index=True, sa_column_kwargs={"unique": True})

    name: str = Field(index=True)
    city: Optional[str] = None
    state: Optional[str] = Field(default=None, index=True)
    zip: Optional[str] = None

    latitude: Optional[float] = None
    longitude: Optional[float] = None

    # 1=Public, 2=Private nonprofit, 3=Private for-profit (Scorecard CONTROL)
    control: Optional[int] = Field(default=None, index=True)

    admission_rate: Optional[float] = Field(default=None, index=True)
    sat_avg: Optional[int] = Field(default=None, index=True)
    act_mid: Optional[int] = Field(default=None, index=True)

    tuition_in: Optional[int] = Field(default=None, index=True)
    tuition_out: Optional[int] = Field(default=None, index=True)

    ug_enrollment: Optional[int] = Field(default=None, index=True)

    grad_rate_4yr: Optional[float] = None     # C150_4
    grad_rate_lt4: Optional[float] = None     # C150_L4

    median_earnings_10yr: Optional[int] = None  # MD_EARN_WNE_P10

    school_url: Optional[str] = None
    net_price_url: Optional[str] = None

    # Optional: keep extra fields future-proof without 3306 cols
    raw_scorecard: Optional[dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSONB, nullable=True),
    )