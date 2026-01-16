"""create shares table fix

Revision ID: aa1b2c3d4e78
Revises: 298f5b9b796d
Create Date: 2025-09-03 18:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'aa1b2c3d4e78'
down_revision: Union[str, None] = '298f5b9b796d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()
    if 'shares' not in tables:
        op.create_table(
            'shares',
            sa.Column('id', sa.Integer(), primary_key=True, nullable=False),
            sa.Column('node_id', sa.Integer(), sa.ForeignKey('storage_nodes.id', ondelete='CASCADE'), nullable=False),
            sa.Column('shared_with_user_id', sa.Integer(), nullable=False),
            sa.Column('shared_by_user_id', sa.Integer(), nullable=False),
            sa.Column('type_user_sender', sa.String(length=50), nullable=True),
            sa.Column('type_user_receiver', sa.String(length=50), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
        )
        op.create_index('ix_shares_node_id', 'shares', ['node_id'])
        op.create_index('ix_shares_shared_with', 'shares', ['shared_with_user_id'])


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()
    if 'shares' in tables:
        op.drop_index('ix_shares_node_id', table_name='shares')
        op.drop_index('ix_shares_shared_with', table_name='shares')
        op.drop_table('shares')
