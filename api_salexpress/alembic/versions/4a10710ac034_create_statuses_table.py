"""create statuses table

Revision ID: 4a10710ac034
Revises: 63f0bb75a59c
Create Date: 2025-09-03 23:23:34.578031

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4a10710ac034'
down_revision: Union[str, None] = '63f0bb75a59c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
