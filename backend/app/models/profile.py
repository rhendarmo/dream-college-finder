from typing import Optional
from sqlmodel import SQLModel, Field


class Profile(SQLModel, table=True):
    __tablename__ = "profiles"

    id: Optional[int] = Field(default=None, primary_key=True)

    gpa: float
    sat: Optional[int] = None
    act: Optional[int] = None

    intended_major: str
    location_preference: Optional[str] = None
    notes: Optional[str] = None


class ProfileCreate(SQLModel):
    gpa: float
    sat: Optional[int] = None
    act: Optional[int] = None
    intended_major: str
    location_preference: Optional[str] = None
    notes: Optional[str] = None