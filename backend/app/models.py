from typing import Optional
from sqlmodel import SQLModel, Field


class Profile(SQLModel, table=True):
    __tablename__ = "profiles"

    id: Optional[int] = Field(default=None, primary_key=True)

    # Core academic inputs
    gpa: float
    sat: Optional[int] = None
    act: Optional[int] = None

    intended_major: str

    # Preferences (keep simple for now)
    location_preference: Optional[str] = None  # e.g., "CA", "West Coast", "Any"
    notes: Optional[str] = None  # free text / short resume paste

    created_at: Optional[str] = None  # keep simple; we can upgrade to datetime later


class ProfileCreate(SQLModel):
    gpa: float
    sat: Optional[int] = None
    act: Optional[int] = None
    intended_major: str
    location_preference: Optional[str] = None
    notes: Optional[str] = None