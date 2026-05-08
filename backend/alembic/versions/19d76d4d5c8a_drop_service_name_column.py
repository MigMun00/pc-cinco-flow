"""drop service name column

Revision ID: 19d76d4d5c8a
Revises: bf809c3d679e
Create Date: 2026-05-07 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "19d76d4d5c8a"
down_revision: Union[str, Sequence[str], None] = "bf809c3d679e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column("services", "name")


def downgrade() -> None:
    op.add_column(
        "services",
        sa.Column("name", sa.String(length=255), nullable=False, server_default=""),
    )
    op.alter_column("services", "name", server_default=None)
