"""create storage nodes table

Revision ID: 8b5c8d9e3c21
Revises: 
Create Date: 2025-09-02 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
import sqlalchemy.dialects.mysql as mysql

# revision identifiers, used by Alembic.
revision = '8b5c8d9e3c21'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        'storage_nodes',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('type', sa.Enum('file','folder', name='nodetype'), nullable=False),
        sa.Column('parent_id', sa.Integer(), sa.ForeignKey('storage_nodes.id'), nullable=True),
        sa.Column('business_id', sa.Integer(), nullable=True),
        sa.Column('size', sa.String(length=50), nullable=True),
        sa.Column('extension', sa.String(length=20), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=True),
        sa.Column('comments', sa.Text(), nullable=True),
        sa.Column('url', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

def downgrade() -> None:
    op.drop_table('storage_nodes')
    op.execute('DROP TYPE IF EXISTS nodetype')
