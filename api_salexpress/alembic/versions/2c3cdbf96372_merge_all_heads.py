"""merge_all_heads

Revision ID: 2c3cdbf96372
Revises: add_email_avaliador, create_document_logs, criar_aval_Salexpress, f5ea5d6df5ca
Create Date: 2025-11-24 10:32:11.141765

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2c3cdbf96372'
down_revision: Union[str, None] = ('add_email_avaliador', 'create_document_logs', 'criar_aval_Salexpress', 'f5ea5d6df5ca')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
