from sqlalchemy.orm import Session
from ..models import Message
from ..schemas import MessageCreate

def get_message(db: Session, message_id: int):
    return db.query(Message).filter(Message.id == message_id).first()

def get_messages(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Message).offset(skip).limit(limit).all()

def create_message(db: Session, message: MessageCreate):
    db_message = Message(content=message.content, role=message.role)
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

def delete_message(db: Session, message_id: int):
    message = db.query(Message).filter(Message.id == message_id).first()
    db.delete(message)
    db.commit()
    return message

def update_message(db: Session, message_id: int, new_content: str):
    message = db.query(Message).filter(Message.id == message_id).first()
    message.content = new_content
    db.commit()
    return message
