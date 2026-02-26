"""enforce one profile per user

Revision ID: 25819cc38b62
Revises: f83e569a027e
Create Date: 2026-02-25 22:55:34.222235

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '25819cc38b62'
down_revision: Union[str, Sequence[str], None] = 'f83e569a027e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade():
    op.execute(
        """
        WITH ranked AS (
          SELECT
            id,
            user_id,
            ROW_NUMBER() OVER (
              PARTITION BY user_id
              ORDER BY
                (
                  (CASE WHEN sat IS NOT NULL THEN 1 ELSE 0 END) +
                  (CASE WHEN act IS NOT NULL THEN 1 ELSE 0 END) +
                  (CASE WHEN location_preference IS NOT NULL THEN 1 ELSE 0 END) +
                  (CASE WHEN notes IS NOT NULL THEN 1 ELSE 0 END)
                ) DESC,
                id DESC
            ) AS rn
          FROM profiles
        )
        DELETE FROM profiles p
        USING ranked r
        WHERE p.id = r.id
          AND r.rn > 1;
        """
    )

    op.create_unique_constraint("uq_profiles_user_id", "profiles", ["user_id"])

def downgrade():
    op.drop_constraint("uq_profiles_user_id", "profiles", type_="unique")