"""add_company_id_and_company_type_to_storage_nodes

Revision ID: c39ecc416df6
Revises: f3d55fdf67ca
Create Date: 2025-11-09 11:09:00.485748

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c39ecc416df6'
down_revision: Union[str, None] = 'f3d55fdf67ca'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Adicionar campos company_id e company_type à tabela storage_nodes
    op.add_column('storage_nodes', sa.Column('company_id', sa.Integer(), nullable=True, comment='ID da empresa responsável'))
    op.add_column('storage_nodes', sa.Column('company_type', sa.String(length=50), nullable=True, comment='Tipo da empresa'))
    
    # Adicionar índice em company_id para performance
    op.create_index(op.f('ix_storage_nodes_company_id'), 'storage_nodes', ['company_id'], unique=False)


def downgrade() -> None:
    # Remover índice
    op.drop_index(op.f('ix_storage_nodes_company_id'), table_name='storage_nodes')
    
    # Remover colunas
    op.drop_column('storage_nodes', 'company_type')
    op.drop_column('storage_nodes', 'company_id')
