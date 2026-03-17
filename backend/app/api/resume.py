from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel import Session, select

from app.db.session import get_session
from app.dependencies.auth_deps import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.services.resume_extractor import extract_pdf_text
from app.services.resume_parser import parse_resume_to_json

router = APIRouter(prefix="/resume", tags=["resume"])


@router.get("/me", response_model=Resume)
def get_my_resume(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    r = session.exec(select(Resume).where(Resume.user_id == current_user.id)).first()
    if not r:
        raise HTTPException(status_code=404, detail="No resume uploaded")
    return r


@router.post("/upload", response_model=Resume)
async def upload_resume(
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Please upload a PDF")

    data = await file.read()
    text = extract_pdf_text(data)
    if not text.strip():
        raise HTTPException(
            status_code=400,
            detail="Could not extract text from this PDF. Try exporting as 'text-based PDF' (not scanned).",
        )

    parsed = parse_resume_to_json(text)

    existing = session.exec(select(Resume).where(Resume.user_id == current_user.id)).first()
    if not existing:
        existing = Resume(user_id=current_user.id, filename=file.filename, text=text, parsed=parsed)
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return existing

    existing.filename = file.filename
    existing.text = text
    existing.parsed = parsed
    session.add(existing)
    session.commit()
    session.refresh(existing)
    return existing