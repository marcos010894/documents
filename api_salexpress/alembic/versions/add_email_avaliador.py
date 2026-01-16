"""add email avaliador

Revision ID: add_email_avaliador
Revises: add_Salexpress_eval
Create Date: 2025-11-13

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_email_avaliador'
down_revision = 'add_Salexpress_eval'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Adiciona campo email_avaliador à tabela avaliacoes"""
    
    # Adicionar coluna email_avaliador (String, nullable)
    op.add_column('avaliacoes', sa.Column('email_avaliador', sa.String(200), nullable=True))


def downgrade() -> None:
    """Remove campo email_avaliador"""
    
    # Remover coluna
    op.drop_column('avaliacoes', 'email_avaliador')
