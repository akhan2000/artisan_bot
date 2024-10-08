# app/schemas/message.py

from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class MessageBase(BaseModel):
    role: str
    content: str
    context: Optional[str] = "Onboarding"  # New field

class ClickActionRequest(BaseModel):
    action_type: str
    context: str


class MessageCreate(MessageBase):
    pass


class Message(MessageBase):
    id: int
    timestamp: datetime
    user_id: int
    parent_id: Optional[int] = None
    is_edited: bool
    is_deleted: bool

    class Config:
        from_attributes = True

class MessageUpdate(BaseModel):
    content: str
