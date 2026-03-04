from __future__ import annotations

import os
from typing import Any

from dotenv import load_dotenv
from openai import OpenAI
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import delete
from sqlmodel import Session, select

from app.models.rag import RagDocument, RagEmbedding
from app.models.school import School
from app.services.rag_build_docs import build_school_card

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
EMBED_MODEL = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")


def embed_text(text_: str) -> list[float]:
    res = client.embeddings.create(model=EMBED_MODEL, input=text_)
    return res.data[0].embedding


def upsert_doc(session: Session, doc: dict[str, Any]) -> int:
    """
    Upsert a RagDocument by source_id and return its id.
    Uses __table__ to avoid SQLAlchemy ORM MetaData collisions.
    """

    # In case anything upstream still produces "metadata"
    if "metadata" in doc and "meta" not in doc:
        doc["meta"] = doc.pop("metadata")
    doc.pop("metadata", None)

    stmt = insert(RagDocument.__table__).values(**doc)
    excluded = stmt.excluded

    stmt = (
        stmt.on_conflict_do_update(
            index_elements=["source_id"],  # requires UNIQUE on source_id
            set_={
                "doc_type": excluded.doc_type,
                "title": excluded.title,
                "content": excluded.content,
                "meta": excluded.meta,
            },
        )
        .returning(RagDocument.id)
    )

    # NOTE: no commit here; let caller batch commits for speed
    doc_id = session.exec(stmt).scalar_one()
    return doc_id


def upsert_embedding(session: Session, doc_id: int, emb: list[float]) -> None:
    # delete existing embedding row(s) for this document
    session.exec(delete(RagEmbedding).where(RagEmbedding.document_id == doc_id))
    # insert new
    session.add(RagEmbedding(document_id=doc_id, embedding=emb))


def index_schools(session: Session, limit: int | None = None) -> None:
    q = select(School)
    schools = session.exec(q).all()
    if limit:
        schools = schools[:limit]

    for i, s in enumerate(schools, start=1):
        content, meta = build_school_card(session, s)

        doc = {
            "doc_type": "school_card",
            "source_id": f"UNITID:{s.unitid}",
            "title": s.name,
            "content": content,
            "meta": meta,  # ✅ meta not metadata
        }

        doc_id = upsert_doc(session, doc)
        emb = embed_text(content)
        upsert_embedding(session, doc_id, emb)

        # Commit in batches for speed
        if i % 50 == 0:
            session.commit()
            print(f"Indexed {i} schools...")

    session.commit()
    print("✅ RAG indexing complete")