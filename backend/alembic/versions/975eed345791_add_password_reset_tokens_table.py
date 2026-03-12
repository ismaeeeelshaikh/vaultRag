"""Add password reset tokens, signup otp tokens, chat sessions and chat messages tables

Revision ID: 975eed345791
Revises: ead537a66732
Create Date: 2025-10-02 17:34:30.927959

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '975eed345791'
down_revision: Union[str, Sequence[str], None] = 'ead537a66732'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create chat_sessions table
    op.create_table('chat_sessions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False, server_default='New Chat'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_chat_sessions_id'), 'chat_sessions', ['id'], unique=False)
    op.create_index('idx_chat_sessions_user_id', 'chat_sessions', ['user_id'], unique=False)

    # Create chat_messages table
    op.create_table('chat_messages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('chat_session_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('question', sa.Text(), nullable=False),
        sa.Column('answer', sa.Text(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['chat_session_id'], ['chat_sessions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_chat_messages_id'), 'chat_messages', ['id'], unique=False)
    op.create_index('idx_chat_messages_session_id', 'chat_messages', ['chat_session_id'], unique=False)
    op.create_index('idx_chat_messages_user_id', 'chat_messages', ['user_id'], unique=False)

    # Create password_reset_tokens table
    op.create_table('password_reset_tokens',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('otp', sa.String(), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('used', sa.Integer(), server_default='0', nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_password_reset_tokens_id'), 'password_reset_tokens', ['id'], unique=False)
    op.create_index(op.f('ix_password_reset_tokens_otp'), 'password_reset_tokens', ['otp'], unique=False)

    # Create signup_otp_tokens table
    op.create_table('signup_otp_tokens',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('otp', sa.String(), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_signup_otp_tokens_id'), 'signup_otp_tokens', ['id'], unique=False)
    op.create_index(op.f('ix_signup_otp_tokens_email'), 'signup_otp_tokens', ['email'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_signup_otp_tokens_email'), table_name='signup_otp_tokens')
    op.drop_index(op.f('ix_signup_otp_tokens_id'), table_name='signup_otp_tokens')
    op.drop_table('signup_otp_tokens')
    op.drop_index(op.f('ix_password_reset_tokens_otp'), table_name='password_reset_tokens')
    op.drop_index(op.f('ix_password_reset_tokens_id'), table_name='password_reset_tokens')
    op.drop_table('password_reset_tokens')
    op.drop_index('idx_chat_messages_user_id', table_name='chat_messages')
    op.drop_index('idx_chat_messages_session_id', table_name='chat_messages')
    op.drop_index(op.f('ix_chat_messages_id'), table_name='chat_messages')
    op.drop_table('chat_messages')
    op.drop_index('idx_chat_sessions_user_id', table_name='chat_sessions')
    op.drop_index(op.f('ix_chat_sessions_id'), table_name='chat_sessions')
    op.drop_table('chat_sessions')
