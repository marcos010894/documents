"""create statuses table

Revision ID: 08f53f2cd713
Revises: 4a10710ac034
Create Date: 2025-09-03 23:24:21.152061

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '08f53f2cd713'
down_revision: Union[str, None] = '4a10710ac034'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if 'statuses' not in inspector.get_table_names():
        op.create_table(
            'statuses',
            sa.Column('id', sa.Integer(), primary_key=True, nullable=False),
            sa.Column('id_business', sa.Integer(), nullable=False),
            sa.Column('type_user', sa.String(length=50), nullable=False),
            sa.Column('name', sa.String(length=100), nullable=False),
            sa.Column('color', sa.String(length=20), nullable=False),
        )
        op.create_index('ix_statuses_id', 'statuses', ['id'])


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if 'statuses' in inspector.get_table_names():
        op.drop_index('ix_statuses_id', table_name='statuses')
        op.drop_table('statuses')
