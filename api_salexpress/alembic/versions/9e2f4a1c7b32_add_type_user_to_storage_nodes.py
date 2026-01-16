"""add type_user column to storage_nodes

Revision ID: 9e2f4a1c7b32
Revises: 8b5c8d9e3c21
Create Date: 2025-09-02 00:10:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '9e2f4a1c7b32'
down_revision = '8b5c8d9e3c21'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column('storage_nodes', sa.Column('type_user', sa.String(length=50), nullable=True))


def downgrade() -> None:
    op.drop_column('storage_nodes', 'type_user')
