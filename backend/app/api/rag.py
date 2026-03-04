from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session

from app.db.session import get_session
from app.dependencies.auth_deps import get_current_user
from app.models.user import User
from app.services.rag_retriever import retrieve
from openai import OpenAI
import os

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
CHAT_MODEL = os.getenv("OPENAI_CHAT_MODEL", "gpt-4.1-mini")

router = APIRouter(prefix="/rag", tags=["rag"])


class AskRequest(BaseModel):
    question: str
    top_k: int = 6


class Citation(BaseModel):
    source_id: str
    title: str


class AskResponse(BaseModel):
    answer: str
    citations: list[Citation]


@router.post("/ask", response_model=AskResponse)
def ask_rag(
    payload: AskRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    docs = retrieve(session, payload.question, top_k=payload.top_k)

    context = "\n\n---\n\n".join(
        [f"[{i+1}] {d.title}\nSOURCE={d.source_id}\n{d.content}" for i, d in enumerate(docs)]
    )

    system = (
        "You are a college recommendation assistant. "
        "Answer ONLY using the provided context. "
        "If the context is insufficient, say what is missing. "
        "Cite sources by bracket number like [1], [2]."
    )

    user = f"QUESTION:\n{payload.question}\n\nCONTEXT:\n{context}"

    completion = client.chat.completions.create(
        model=CHAT_MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        temperature=0.2,
    )

    answer = completion.choices[0].message.content or ""

    citations = [{"source_id": d.source_id, "title": d.title} for d in docs]
    return {"answer": answer, "citations": citations}