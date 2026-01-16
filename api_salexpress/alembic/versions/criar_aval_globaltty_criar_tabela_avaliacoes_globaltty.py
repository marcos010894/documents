"""criar_tabela_avaliacoes_Salexpress

Revision ID: criar_aval_Salexpress
Revises: 
Create Date: 2025-11-19

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import func


# revision identifiers, used by Alembic.
revision = 'criar_aval_Salexpress'
down_revision = None  # Coloque aqui o ID da última migration
branch_labels = None
depends_on = None


def upgrade():
    # Criar tabela avaliacoes_Salexpress
    op.create_table(
        'avaliacoes_Salexpress',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('avaliacao_id', sa.Integer(), nullable=False),
        sa.Column('nome_avaliador', sa.String(length=200), nullable=False),
        sa.Column('email_avaliador', sa.String(length=200), nullable=True),
        sa.Column('nota_busca_fornecedor', sa.Float(), nullable=False, comment='Como você avalia a experiência de buscar um fornecedor pela plataforma Salexpress?'),
        sa.Column('comentario_experiencia', sa.Text(), nullable=True, comment='Comentário sobre a experiência na plataforma'),
        sa.Column('created_at', sa.DateTime(), server_default=func.now(), nullable=False),
        sa.Column('ip_avaliador', sa.String(length=45), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['avaliacao_id'], ['avaliacoes.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_avaliacoes_Salexpress_avaliacao_id', 'avaliacoes_Salexpress', ['avaliacao_id'])
    
    # Remover colunas antigas da tabela avaliacoes (se existirem)
    # Verificar se as colunas existem antes de remover
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    columns = [col['name'] for col in inspector.get_columns('avaliacoes')]
    
    if 'nota_Salexpress' in columns:
        op.drop_column('avaliacoes', 'nota_Salexpress')
    
    if 'comentario_Salexpress' in columns:
        op.drop_column('avaliacoes', 'comentario_Salexpress')


def downgrade():
    # Adicionar colunas de volta na tabela avaliacoes
    op.add_column('avaliacoes', sa.Column('nota_Salexpress', sa.Float(), nullable=True))
    op.add_column('avaliacoes', sa.Column('comentario_Salexpress', sa.Text(), nullable=True))
    
    # Remover tabela avaliacoes_Salexpress
    op.drop_index('ix_avaliacoes_Salexpress_avaliacao_id', table_name='avaliacoes_Salexpress')
    op.drop_table('avaliacoes_Salexpress')
