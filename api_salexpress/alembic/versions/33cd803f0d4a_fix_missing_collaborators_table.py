"""fix_missing_collaborators_table

Revision ID: 33cd803f0d4a
Revises: 5bad70a3733d
Create Date: 2025-12-14 15:35:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector


# revision identifiers, used by Alembic.
revision: str = '33cd803f0d4a'
down_revision: Union[str, None] = '5bad70a3733d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Verificar se a tabela já existe antes de tentar criar
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)
    tables = inspector.get_table_names()

    if 'company_collaborators' not in tables:
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
        # Recriar índices
        op.create_index('idx_collaborator_company', 'company_collaborators', ['company_id', 'company_type'])
        op.create_index('idx_collaborator_email', 'company_collaborators', ['email'])


def downgrade() -> None:
    # Não vamos dropar no downgrade para evitar acidentes futuros, 
    # já que essa migration é um fix.
    pass
