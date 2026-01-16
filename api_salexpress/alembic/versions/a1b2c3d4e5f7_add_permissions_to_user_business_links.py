"""add_permissions_to_user_business_links

Revision ID: a1b2c3d4e5f7
Revises: f3d55fdf67ca
Create Date: 2025-12-22 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql # Assuming Postgres since JSON type is used

# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f7'
down_revision: Union[str, None] = '8946b855de3f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Adicionar coluna permissions JSON
    op.add_column('user_business_links', sa.Column('permissions', sa.JSON(), nullable=True))


def downgrade() -> None:
    # Remover coluna permissions
    op.drop_column('user_business_links', 'permissions')
