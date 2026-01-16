"""add_allow_editing_to_shares

Revision ID: 8946b855de3f
Revises: 33cd803f0d4a
Create Date: 2025-12-14 16:09:31.170229

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8946b855de3f'
down_revision: Union[str, None] = '33cd803f0d4a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('shares', sa.Column('allow_editing', sa.Boolean(), nullable=False, server_default=sa.false()))


def downgrade() -> None:
    op.drop_column('shares', 'allow_editing')
