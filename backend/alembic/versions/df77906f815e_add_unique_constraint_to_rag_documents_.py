"""add unique constraint to rag_documents.source_id

Revision ID: df77906f815e
Revises: 76408ad6ff23
Create Date: 2026-03-03 21:51:59.587712

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'df77906f815e'
down_revision: Union[str, Sequence[str], None] = '76408ad6ff23'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.create_unique_constraint(
        "uq_rag_documents_source_id",
        "rag_documents",
        ["source_id"],
    )

def downgrade():
    op.drop_constraint(
        "uq_rag_documents_source_id",
        "rag_documents",
        type_="unique",
    )