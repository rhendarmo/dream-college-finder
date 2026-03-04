from sqlmodel import Session, select
from app.models.user import User


def get_user_by_email(session: Session, email: str) -> User | None:
    return session.exec(select(User).where(User.email == email)).first()


def get_user(session: Session, user_id: int) -> User | None:
    return session.get(User, user_id)


def create_user(session: Session, email: str, password_hash: str) -> User:
    user = User(email=email.lower().strip(), password_hash=password_hash)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def set_email_verified(session: Session, user: User) -> None:
    user.is_email_verified = True
    session.add(user)
    session.commit()