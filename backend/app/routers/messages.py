from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..crud import message as crud
from ..schemas import Message, MessageCreate
from ..dependencies import get_db
from pydantic import BaseModel  # Import BaseModel to define the request body

router = APIRouter()

# Define a new Pydantic model for the update
class MessageUpdate(BaseModel):
    content: str

@router.post("/messages/", response_model=Message)
def create_message(message: MessageCreate, db: Session = Depends(get_db)):
    return crud.create_message(db=db, message=message)

@router.get("/messages/{message_id}", response_model=Message)
def read_message(message_id: int, db: Session = Depends(get_db)):
    db_message = crud.get_message(db=db, message_id=message_id)
    if db_message is None:
        raise HTTPException(status_code=404, detail="Message not found")
    return db_message

@router.get("/messages/", response_model=list[Message])
def read_messages(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_messages(db=db, skip=skip, limit=limit)

@router.delete("/messages/{message_id}", response_model=Message)
def delete_message(message_id: int, db: Session = Depends(get_db)):
    return crud.delete_message(db=db, message_id=message_id)

# Update this function to accept a JSON body instead of a query parameter
@router.put("/messages/{message_id}", response_model=Message)
def update_message(message_id: int, update_data: MessageUpdate, db: Session = Depends(get_db)):
    return crud.update_message(db=db, message_id=message_id, new_content=update_data.content)
