# backend/app/routers/messages.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..crud import message as crud
from ..schemas.message import Message, MessageCreate, MessageUpdate
from ..database import get_db
from ..auth import get_current_user
from ..schemas.user import UserRead

router = APIRouter(
    prefix="/messages",
    tags=["messages"],
    dependencies=[Depends(get_current_user)],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=Message)
def create_message(message: MessageCreate, db: Session = Depends(get_db), current_user: UserRead = Depends(get_current_user)):
    return crud.create_message(db=db, message=message, user_id=current_user.id)

@router.get("/{message_id}", response_model=Message)
def read_message(message_id: int, db: Session = Depends(get_db), current_user: UserRead = Depends(get_current_user)):
    db_message = crud.get_message(db=db, message_id=message_id, user_id=current_user.id)
    if db_message is None:
        raise HTTPException(status_code=404, detail="Message not found")
    return db_message

@router.get("/", response_model=list[Message])
def read_messages(skip: int = 0, limit: int = 10, db: Session = Depends(get_db), current_user: UserRead = Depends(get_current_user)):
    return crud.get_messages(db=db, user_id=current_user.id, skip=skip, limit=limit)

@router.delete("/{message_id}", response_model=Message)
def delete_message(message_id: int, db: Session = Depends(get_db), current_user: UserRead = Depends(get_current_user)):
    deleted_message = crud.delete_message(db=db, message_id=message_id, user_id=current_user.id)
    if not deleted_message:
        raise HTTPException(status_code=404, detail="Message not found or not authorized")
    return deleted_message

@router.put("/{message_id}", response_model=Message)
def update_message(message_id: int, update_data: MessageUpdate, db: Session = Depends(get_db), current_user: UserRead = Depends(get_current_user)):
    updated_message = crud.update_message(db=db, message_id=message_id, new_content=update_data.content, user_id=current_user.id)
    if not updated_message:
        raise HTTPException(status_code=404, detail="Message not found or not authorized")
    return updated_message


@router.post("/click_action")
def click_action(action_type: str, context: str, db: Session = Depends(get_db), current_user: int = Depends(get_current_user)):
    response = crud.handle_click_action(db, current_user, action_type, context)
    return {"response": response}