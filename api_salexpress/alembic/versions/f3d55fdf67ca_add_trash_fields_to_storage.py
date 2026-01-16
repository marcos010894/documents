"""add_trash_fields_to_storage

Revision ID: f3d55fdf67ca
Revises: 7b345a31b38c
Create Date: 2025-11-08 14:04:04.265249

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f3d55fdf67ca'
down_revision: Union[str, None] = '7b345a31b38c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Adicionar campos para soft delete (lixeira)
    op.add_column('storage_nodes', sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('storage_nodes', sa.Column('deleted_by_id', sa.Integer(), nullable=True))
    op.add_column('storage_nodes', sa.Column('deleted_by_type', sa.String(50), nullable=True))
    
    # Criar índice para melhorar performance de queries que filtram deleted_at
    op.create_index('ix_storage_nodes_deleted_at', 'storage_nodes', ['deleted_at'])


def downgrade() -> None:
    # Remover índice
    op.drop_index('ix_storage_nodes_deleted_at', table_name='storage_nodes')
    
    # Remover colunas
    op.drop_column('storage_nodes', 'deleted_by_type')
    op.drop_column('storage_nodes', 'deleted_by_id')
    op.drop_column('storage_nodes', 'deleted_at')
