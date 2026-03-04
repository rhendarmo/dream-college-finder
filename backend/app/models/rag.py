# backend/app/models/rag.py
from __future__ import annotations
from typing import Optional, Any
from sqlmodel import SQLModel, Field
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from pgvector.sqlalchemy import Vector

class RagDocument(SQLModel, table=True):
    __tablename__ = "rag_documents"

    id: Optional[int] = Field(default=None, primary_key=True)
    doc_type: str = Field(index=True)
    source_id: str = Field(index=True)
    title: str
    content: str

    meta: dict[str, Any] = Field(default_factory=dict, sa_column=Column("meta", JSONB))

class RagEmbedding(SQLModel, table=True):
    __tablename__ = "rag_embeddings"

    id: Optional[int] = Field(default=None, primary_key=True)
    document_id: int = Field(index=True)
    embedding: list[float] = Field(sa_column=Column(Vector(1536)))