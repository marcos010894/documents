"""add Salexpress evaluation fields

Revision ID: add_Salexpress_eval
Revises: 
Create Date: 2025-01-19

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_Salexpress_eval'
down_revision = None  # Ajuste conforme necessário
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Adiciona campos de avaliação da Salexpress à tabela avaliacoes"""
    
    # Adicionar coluna nota_Salexpress (Float, nullable)
    op.add_column('avaliacoes', sa.Column('nota_Salexpress', sa.Float(), nullable=True))
    
    # Adicionar coluna comentario_Salexpress (Text, nullable)
    op.add_column('avaliacoes', sa.Column('comentario_Salexpress', sa.Text(), nullable=True))


def downgrade() -> None:
    """Remove campos de avaliação da Salexpress"""
    
    # Remover colunas
    op.drop_column('avaliacoes', 'comentario_Salexpress')
    op.drop_column('avaliacoes', 'nota_Salexpress')
