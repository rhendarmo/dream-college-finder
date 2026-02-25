from sqlmodel import Session, select
from app.models.email_verification import EmailVerificationToken


def create_verification_token(session: Session, user_id: int, token_hash: str, expires_at_unix: int) -> EmailVerificationToken:
    row = EmailVerificationToken(user_id=user_id, token_hash=token_hash, expires_at_unix=expires_at_unix, used=False)
    session.add(row)
    session.commit()
    session.refresh(row)
    return row


def get_token_row(session: Session, token_hash: str) -> EmailVerificationToken | None:
    return session.exec(select(EmailVerificationToken).where(EmailVerificationToken.token_hash == token_hash)).first()


def mark_used(session: Session, row: EmailVerificationToken) -> None:
    row.used = True
    session.add(row)
    session.commit()