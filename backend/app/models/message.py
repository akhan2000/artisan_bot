# app/models/message.py

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    role = Column(String, index=True)  # "user" or "assistant"
    content = Column(String, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey('users.id'))
    context = Column(String, default="Onboarding")  # New field
    is_edited = Column(Boolean, default=False)  # New field
    is_deleted = Column(Boolean, default=False)  # For delete functionality

    parent_id = Column(Integer, ForeignKey('messages.id'), nullable=True)  # New field
    parent_message = relationship('Message', remote_side=[id], backref='responses')
    user = relationship('User', back_populates='messages')

# index optimizes queries filtering by both user_id and context
    __table_args__ = (
        Index('idx_user_context', 'user_id', 'context'),
    )
