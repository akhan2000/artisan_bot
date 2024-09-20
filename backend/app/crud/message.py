from sqlalchemy.orm import Session
from openai import OpenAI
import os
from .. import models, schemas
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OpenAI API key not found. Please set the OPENAI_API_KEY environment variable.")

client = OpenAI(api_key=OPENAI_API_KEY)

def create_message(db: Session, message: schemas.MessageCreate, user_id: int):
    db_message = models.Message(**message.dict(), user_id=user_id)
    db.add(db_message)
    db.commit()
    db.refresh(db_message)

    context = db_message.context
    assistant_response = generate_response(db_message.content, context, db, user_id)

    db_assistant_message = models.Message(
        role="assistant",
        content=assistant_response,
        user_id=user_id,
        context=context
    )
    db.add(db_assistant_message)
    db.commit()
    db.refresh(db_assistant_message)

    return db_message

def generate_response(user_input: str, context: str, db: Session, user_id: int, action_type: Optional[str] = None, history_limit: int = 5) -> str:
    try:
        recent_messages = get_recent_messages_by_context(db, user_id, context=context, limit=history_limit)
        user_history = " ".join([msg.content for msg in recent_messages])

        system_prompts = {
            "Onboarding": f"You are Ava, an AI BDR specializing in B2B sales automation. Previous history: {user_history}.",
            "Support": f"You are Elijah, an AI support expert. Previous history: {user_history}.",
            "Marketing": f"You are Lucas, an AI marketing strategist. Previous history: {user_history}.",
        }

        if action_type == "create_lead":
            system_prompt = f"{system_prompts[context]} The user wants to create a new lead. Ask for the lead’s name and contact information."
        elif action_type == "schedule_follow_up":
            system_prompt = f"{system_prompts[context]} The user wants to schedule a follow-up. Ask for the date and time."
        elif action_type == "generate_email_template":
            system_prompt = f"{system_prompts[context]} The user wants to generate an email template. Ask for the recipient and subject."
        else:
            system_prompt = system_prompts.get(context, "You are an assistant. How can I assist you today?")

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_input}
            ],
            max_tokens=200,
            temperature=0.7 if context == "Marketing" else 0.5
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        print(f"Error generating response from OpenAI: {e}")
        return fallback_response(user_input, context)

def get_recent_messages_by_context(db: Session, user_id: int, context: str, limit: int = 5) -> list[models.Message]:
    return db.query(models.Message).filter(models.Message.user_id == user_id, models.Message.context == context).order_by(models.Message.timestamp.desc()).limit(limit).all()

def get_messages(db: Session, user_id: int, skip: int = 0, limit: int = 10) -> list[models.Message]:
    return db.query(models.Message).filter(models.Message.user_id == user_id).order_by(models.Message.timestamp.asc()).offset(skip).limit(limit).all()

def fallback_response(user_input: str, context: str) -> str:
    user_input_lower = user_input.lower()
    if context == "Onboarding":
        if "help" in user_input_lower:
            return "Sure, I'm here to help you get started. What would you like to know?"
        return "Welcome to our platform! How can I assist you today?"
    elif context == "Support":
        if "issue" in user_input_lower:
            return "I'm sorry you're experiencing issues. Can you please describe the problem?"
        return "I'm here to help you with any support-related questions."
    elif context == "Marketing":
        if "features" in user_input_lower:
            return "We have launched several new features, including ... Would you like to learn more?"
        return "Check out our latest features and promotions!"
    else:
        return "How can I assist you today?"

def delete_message(db: Session, message_id: int, user_id: int) -> Optional[models.Message]:
    message = db.query(models.Message).filter(models.Message.id == message_id, models.Message.user_id == user_id).first()
    if message:
        db.delete(message)
        db.commit()
    return message

def update_message(db: Session, message_id: int, new_content: str, user_id: int) -> Optional[models.Message]:
    message = db.query(models.Message).filter(models.Message.id == message_id, models.Message.user_id == user_id).first()
    if message:
        message.content = new_content
        db.commit()
        db.refresh(message)
    return message

