from typing import Optional
from sqlmodel import SQLModel, Field

class EmailVerificationToken(SQLModel, table=True):
    __tablename__ = "email_verification_tokens"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True)

    # Store ONLY a hash of the token (never store raw token)
    token_hash: str = Field(index=True, unique=True)

    expires_at_unix: int
    used: bool = Field(default=False)