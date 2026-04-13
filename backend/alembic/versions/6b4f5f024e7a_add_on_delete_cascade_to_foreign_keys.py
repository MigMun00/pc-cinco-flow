"""add_on_delete_cascade_to_foreign_keys

Revision ID: 6b4f5f024e7a
Revises: 38dc26e8c758
Create Date: 2026-04-12 12:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "6b4f5f024e7a"
down_revision: Union[str, Sequence[str], None] = "38dc26e8c758"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _replace_fk_ondelete(
    table_name: str,
    constrained_column: str,
    referred_table: str,
    new_fk_name: str,
    ondelete: str | None,
) -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    foreign_keys = inspector.get_foreign_keys(table_name)

    old_fk_name = None
    for fk in foreign_keys:
        if fk.get("constrained_columns") == [constrained_column] and fk.get("referred_table") == referred_table:
            old_fk_name = fk.get("name")
            break

    if old_fk_name:
        op.drop_constraint(old_fk_name, table_name, type_="foreignkey")

    op.create_foreign_key(
        new_fk_name,
        table_name,
        referred_table,
        [constrained_column],
        ["id"],
        ondelete=ondelete,
    )


def _sqlite_recreate_tables(with_cascade: bool) -> None:
    projects_fk = "ON DELETE CASCADE" if with_cascade else ""
    services_fk = "ON DELETE CASCADE" if with_cascade else ""
    expenses_fk = "ON DELETE CASCADE" if with_cascade else ""

    op.execute("PRAGMA foreign_keys=OFF")

    op.execute(
        f"""
        CREATE TABLE projects_new (
            id INTEGER NOT NULL,
            user_id VARCHAR NOT NULL,
            client_id INTEGER NOT NULL,
            name VARCHAR NOT NULL,
            description VARCHAR,
            win_margin FLOAT NOT NULL,
            invoiced BOOLEAN NOT NULL,
            created_at DATETIME NOT NULL,
            custom_fee FLOAT NOT NULL DEFAULT 0,
            PRIMARY KEY (id),
            FOREIGN KEY(client_id) REFERENCES clients (id) {projects_fk}
        )
        """
    )
    op.execute(
        """
        INSERT INTO projects_new (id, user_id, client_id, name, description, win_margin, invoiced, created_at, custom_fee)
        SELECT id, user_id, client_id, name, description, win_margin, invoiced, created_at, custom_fee
        FROM projects
        """
    )
    op.execute("DROP TABLE projects")
    op.execute("ALTER TABLE projects_new RENAME TO projects")
    op.execute("CREATE INDEX ix_projects_id ON projects (id)")

    op.execute(
        f"""
        CREATE TABLE services_new (
            id INTEGER NOT NULL,
            user_id VARCHAR NOT NULL,
            client_id INTEGER NOT NULL,
            name VARCHAR NOT NULL,
            description VARCHAR,
            amount FLOAT NOT NULL,
            invoiced BOOLEAN NOT NULL,
            created_at DATETIME NOT NULL,
            PRIMARY KEY (id),
            FOREIGN KEY(client_id) REFERENCES clients (id) {services_fk}
        )
        """
    )
    op.execute(
        """
        INSERT INTO services_new (id, user_id, client_id, name, description, amount, invoiced, created_at)
        SELECT id, user_id, client_id, name, description, amount, invoiced, created_at
        FROM services
        """
    )
    op.execute("DROP TABLE services")
    op.execute("ALTER TABLE services_new RENAME TO services")
    op.execute("CREATE INDEX ix_services_id ON services (id)")

    op.execute(
        f"""
        CREATE TABLE project_expenses_new (
            id INTEGER NOT NULL,
            user_id VARCHAR NOT NULL,
            project_id INTEGER NOT NULL,
            name VARCHAR NOT NULL,
            description VARCHAR,
            amount FLOAT NOT NULL,
            created_at DATETIME NOT NULL,
            PRIMARY KEY (id),
            FOREIGN KEY(project_id) REFERENCES projects (id) {expenses_fk}
        )
        """
    )
    op.execute(
        """
        INSERT INTO project_expenses_new (id, user_id, project_id, name, description, amount, created_at)
        SELECT id, user_id, project_id, name, description, amount, created_at
        FROM project_expenses
        """
    )
    op.execute("DROP TABLE project_expenses")
    op.execute("ALTER TABLE project_expenses_new RENAME TO project_expenses")
    op.execute("CREATE INDEX ix_project_expenses_id ON project_expenses (id)")

    op.execute("PRAGMA foreign_keys=ON")


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    if bind.dialect.name == "sqlite":
        _sqlite_recreate_tables(with_cascade=True)
        return

    _replace_fk_ondelete(
        table_name="projects",
        constrained_column="client_id",
        referred_table="clients",
        new_fk_name="fk_projects_client_id_clients",
        ondelete="CASCADE",
    )
    _replace_fk_ondelete(
        table_name="services",
        constrained_column="client_id",
        referred_table="clients",
        new_fk_name="fk_services_client_id_clients",
        ondelete="CASCADE",
    )
    _replace_fk_ondelete(
        table_name="project_expenses",
        constrained_column="project_id",
        referred_table="projects",
        new_fk_name="fk_project_expenses_project_id_projects",
        ondelete="CASCADE",
    )


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    if bind.dialect.name == "sqlite":
        _sqlite_recreate_tables(with_cascade=False)
        return

    _replace_fk_ondelete(
        table_name="projects",
        constrained_column="client_id",
        referred_table="clients",
        new_fk_name="fk_projects_client_id_clients",
        ondelete=None,
    )
    _replace_fk_ondelete(
        table_name="services",
        constrained_column="client_id",
        referred_table="clients",
        new_fk_name="fk_services_client_id_clients",
        ondelete=None,
    )
    _replace_fk_ondelete(
        table_name="project_expenses",
        constrained_column="project_id",
        referred_table="projects",
        new_fk_name="fk_project_expenses_project_id_projects",
        ondelete=None,
    )
