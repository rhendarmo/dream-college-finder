"""add users and email verification; profiles owned by users

Revision ID: f83e569a027e
Revises: a890facc85c6
Create Date: 2026-02-23 16:56:45.276850
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f83e569a027e"
down_revision: Union[str, Sequence[str], None] = "a890facc85c6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # 1) Create users table FIRST (referenced by other tables)
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("password_hash", sa.String(), nullable=False),
        sa.Column(
            "is_email_verified",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    # 2) Create email verification tokens (references users)
    op.create_table(
        "email_verification_tokens",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("token_hash", sa.String(), nullable=False),
        sa.Column("expires_at_unix", sa.Integer(), nullable=False),
        sa.Column("used", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_email_verification_tokens_token_hash"),
        "email_verification_tokens",
        ["token_hash"],
        unique=True,
    )
    op.create_index(
        op.f("ix_email_verification_tokens_user_id"),
        "email_verification_tokens",
        ["user_id"],
        unique=False,
    )

    # FK: tokens.user_id -> users.id
    op.create_foreign_key(
        "fk_email_verification_tokens_user_id_users",
        "email_verification_tokens",
        "users",
        ["user_id"],
        ["id"],
        ondelete="CASCADE",
    )

    # 3) DEV-ONLY: wipe existing profiles so adding NOT NULL is safe
    # (If profiles has dependent rows elsewhere, CASCADE ensures they go too.)
    op.execute("TRUNCATE TABLE profiles RESTART IDENTITY CASCADE;")

    # 4) Add profiles.user_id as NOT NULL + index
    op.add_column("profiles", sa.Column("user_id", sa.Integer(), nullable=False))
    op.create_index(op.f("ix_profiles_user_id"), "profiles", ["user_id"], unique=False)

    # FK: profiles.user_id -> users.id
    op.create_foreign_key(
        "fk_profiles_user_id_users",
        "profiles",
        "users",
        ["user_id"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    """Downgrade schema."""

    # Drop FKs first, then indexes/columns/tables
    op.drop_constraint("fk_profiles_user_id_users", "profiles", type_="foreignkey")
    op.drop_index(op.f("ix_profiles_user_id"), table_name="profiles")
    op.drop_column("profiles", "user_id")

    op.drop_constraint(
        "fk_email_verification_tokens_user_id_users",
        "email_verification_tokens",
        type_="foreignkey",
    )
    op.drop_index(op.f("ix_email_verification_tokens_user_id"), table_name="email_verification_tokens")
    op.drop_index(op.f("ix_email_verification_tokens_token_hash"), table_name="email_verification_tokens")
    op.drop_table("email_verification_tokens")

    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")