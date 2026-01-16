"""criar_tabela_colaboradores_empresa

Revision ID: f5ea5d6df5ca
Revises: c39ecc416df6
Create Date: 2025-11-09 23:42:27.950439

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f5ea5d6df5ca'
down_revision: Union[str, None] = 'c39ecc416df6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Criar tabela de colaboradores
    op.create_table(
        'company_collaborators',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False, comment='ID da empresa à qual pertence'),
        sa.Column('company_type', sa.String(length=20), nullable=False, comment='Tipo da empresa (pf/pj/freelancer)'),
        sa.Column('email', sa.String(length=255), nullable=False, unique=True, comment='Email para login'),
        sa.Column('password_hash', sa.String(length=255), nullable=False, comment='Senha criptografada'),
        sa.Column('name', sa.String(length=255), nullable=False, comment='Nome completo'),
        sa.Column('permissions', sa.JSON(), nullable=False, comment='Permissões em formato JSON'),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True, comment='Colaborador ativo?'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    
    # Criar índices para performance
    op.create_index('idx_collaborator_company', 'company_collaborators', ['company_id', 'company_type'])
    op.create_index('idx_collaborator_email', 'company_collaborators', ['email'])


def downgrade() -> None:
    op.drop_index('idx_collaborator_email', table_name='company_collaborators')
    op.drop_index('idx_collaborator_company', table_name='company_collaborators')
    op.drop_table('company_collaborators')
