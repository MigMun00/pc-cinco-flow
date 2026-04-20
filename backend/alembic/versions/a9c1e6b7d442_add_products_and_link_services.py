"""add_products_and_link_services

Revision ID: a9c1e6b7d442
Revises: 6b4f5f024e7a
Create Date: 2026-04-19 12:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a9c1e6b7d442"
down_revision: Union[str, Sequence[str], None] = "6b4f5f024e7a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "products",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("price", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_products_id"), "products", ["id"], unique=False)

    with op.batch_alter_table("services", recreate="auto") as batch_op:
        batch_op.add_column(sa.Column("product_id", sa.Integer(), nullable=True))
        batch_op.create_foreign_key(
            "fk_services_product_id_products",
            "products",
            ["product_id"],
            ["id"],
            ondelete="SET NULL",
        )


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table("services", recreate="auto") as batch_op:
        batch_op.drop_constraint("fk_services_product_id_products", type_="foreignkey")
        batch_op.drop_column("product_id")

    op.drop_index(op.f("ix_products_id"), table_name="products")
    op.drop_table("products")