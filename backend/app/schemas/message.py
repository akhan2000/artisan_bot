# app/schemas/message.py

from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class MessageBase(BaseModel):
    role: str
    content: str
    context: Optional[str] = "Onboarding"  # New field

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: int
    timestamp: datetime
    user_id: int

    class Config:
        from_attributes = True

class MessageUpdate(BaseModel):
    content: str
