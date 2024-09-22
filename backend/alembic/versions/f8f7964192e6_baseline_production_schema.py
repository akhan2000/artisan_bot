"""Baseline Production Schema

Revision ID: f8f7964192e6
Revises: 
Create Date: 2024-09-22 05:58:58.558495

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f8f7964192e6'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    
    op.add_column('messages', sa.Column('is_edited', sa.Boolean(), server_default='false', nullable=False))
    op.add_column('messages', sa.Column('is_deleted', sa.Boolean(), server_default='false', nullable=False))
    op.add_column('messages', sa.Column('parent_id', sa.Integer(), nullable=True))
    op.create_index('idx_user_context', 'messages', ['user_id', 'context'], unique=False)
    op.create_foreign_key(None, 'messages', 'messages', ['parent_id'], ['id'])

    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'messages', type_='foreignkey')
    op.drop_index('idx_user_context', table_name='messages')
    op.drop_column('messages', 'parent_id')
    op.drop_column('messages', 'is_deleted')
    op.drop_column('messages', 'is_edited')
    # ### end Alembic commands ###