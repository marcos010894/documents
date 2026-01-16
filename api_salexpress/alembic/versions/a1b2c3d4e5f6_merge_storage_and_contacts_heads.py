"""merge storage and contacts heads

Revision ID: a1b2c3d4e5f6
Revises: d21c3253e38d, 9e2f4a1c7b32
Create Date: 2025-09-02 12:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = ('d21c3253e38d', '9e2f4a1c7b32')
branch_labels = None
depends_on = None

def upgrade() -> None:
    # No schema changes; merge heads only.
    pass


def downgrade() -> None:
    # Can't automatically unmerge heads.
    pass
