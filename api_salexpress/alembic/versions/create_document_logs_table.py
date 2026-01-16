"""create document logs table

Revision ID: create_document_logs
Revises: 
Create Date: 2025-11-10 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = 'create_document_logs'
down_revision = None  # Ajustar conforme necessário
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'document_logs',
        sa.Column('id', sa.Integer(), nullable=False, autoincrement=True),
        sa.Column('node_id', sa.Integer(), nullable=False, comment='ID do documento/pasta'),
        sa.Column('action', sa.String(50), nullable=False, comment='Ação: created, moved, edited, renamed, deleted, shared, unshared'),
        sa.Column('user_id', sa.Integer(), nullable=False, comment='ID do usuário que fez a ação'),
        sa.Column('user_type', sa.String(20), nullable=False, comment='Tipo: pf, pj, freelancer, collaborator'),
        sa.Column('user_name', sa.String(255), nullable=True, comment='Nome do usuário (cache)'),
        sa.Column('user_email', sa.String(255), nullable=True, comment='Email do usuário (cache)'),
        sa.Column('details', sa.JSON(), nullable=True, comment='Detalhes da ação em JSON'),
        sa.Column('ip_address', sa.String(45), nullable=True, comment='IP do usuário'),
        sa.Column('user_agent', sa.String(500), nullable=True, comment='User agent do navegador'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id'),
        sa.Index('idx_node_id', 'node_id'),
        sa.Index('idx_action', 'action'),
        sa.Index('idx_user_id', 'user_id'),
        sa.Index('idx_created_at', 'created_at'),
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_unicode_ci'
    )


def downgrade():
    op.drop_table('document_logs')
