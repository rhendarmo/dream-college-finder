"""add profile_signature to runs

Revision ID: 4fc89176eff8
Revises: f866a57aa7e1
Create Date: 2026-02-26 13:01:03.308526

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4fc89176eff8'
down_revision: Union[str, Sequence[str], None] = 'f866a57aa7e1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column("recommendation_runs", sa.Column("profile_signature", sa.String(), nullable=False, server_default=""))
    op.create_index("ix_recommendation_runs_profile_signature", "recommendation_runs", ["profile_signature"])


def downgrade() -> None:
    """Downgrade schema."""
    pass
