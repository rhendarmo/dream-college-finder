from __future__ import annotations

import os
from openai import OpenAI
from sqlalchemy import text
from sqlmodel import Session, select

from app.models.rag import RagDocument

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
EMBED_MODEL = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")


def embed_query(q: str) -> list[float]:
    res = client.embeddings.create(model=EMBED_MODEL, input=q)
    return res.data[0].embedding


def retrieve(session: Session, query: str, top_k: int = 6) -> list[RagDocument]:
    qemb = embed_query(query)

    # Safer: pass vector as string, then cast to ::vector on the SQL side
    qvec_str = "[" + ",".join(map(str, qemb)) + "]"

    stmt = (
        text(
            """
            SELECT d.id
            FROM rag_documents d
            JOIN rag_embeddings e ON e.document_id = d.id
            ORDER BY e.embedding <=> (:qvec)::vector
            LIMIT :k
            """
        )
        .bindparams(qvec=qvec_str, k=top_k)
    )

    rows = session.exec(stmt).all()
    doc_ids = [r if isinstance(r, int) else r[0] for r in rows]
    if not doc_ids:
        return []

    docs = session.exec(select(RagDocument).where(RagDocument.id.in_(doc_ids))).all()

    # preserve ranking order
    by_id = {d.id: d for d in docs}
    return [by_id[i] for i in doc_ids if i in by_id]