"""add service date field

Revision ID: 7ab345f1c29b
Revises: 19d76d4d5c8a
Create Date: 2026-05-07 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "7ab345f1c29b"
down_revision: Union[str, Sequence[str], None] = "19d76d4d5c8a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("services", sa.Column("service_date", sa.Date(), nullable=True))
    op.execute(
        "UPDATE services SET service_date = CURRENT_DATE WHERE service_date IS NULL"
    )
    op.alter_column("services", "service_date", existing_type=sa.Date(), nullable=False)


def downgrade() -> None:
    op.drop_column("services", "service_date")
