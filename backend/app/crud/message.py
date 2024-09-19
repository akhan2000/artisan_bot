from typing import Optional
from openai import OpenAI
import os 
from sqlalchemy.orm import Session
from .. import models, schemas
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize OpenAI API key
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OpenAI API key not found. Please set the OPENAI_API_KEY environment variable.")

client = OpenAI(api_key=OPENAI_API_KEY)
import os

def create_message(db: Session, message: schemas.MessageCreate, user_id: int):
    # Create and store the user message
    db_message = models.Message(**message.dict(), user_id=user_id)
    db.add(db_message)
    db.commit()
    db.refresh(db_message)

    # Generate assistant response based on context
    context = db_message.context  # Ensure Message model includes 'context'
    assistant_response = generate_response(db_message.content, context)

    # Create and store the assistant message
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

def generate_response(user_input: str, context: str) -> str:
    """
    Generate a response based on the user input and context using OpenAI's ChatCompletion.
    """
    try:
        # Define system prompt based on context
        system_prompts = {
            "Onboarding": "You are Ava, an AI onboarding expert specialized in B2B sales. Welcome the user to Artisan's platform, guide them through the setup, highlight the key features of lead discovery and personalized outreach, and ensure they understand how Ava can automate their outbound sales process",
            "Support": "You are Elijah, an AI support specialist trained in troubleshooting issues related to B2B data integration, email deliverability optimization, and AI-powered sales workflows. Offer precise solutions for technical problems users may encounter while using the Artisan platform and provide clear steps to resolve them.",
            "Marketing": "You are Lucas, an AI marketing strategist at Artisan. Provide expert advice on our outbound sales solutions, explain the benefits of AI-powered email sequences and lead research tools, and share current promotions or case studies that showcase our impact on improving B2B sales performance."
        }

        system_prompt = system_prompts.get(context, "You are an assistant. How can I help you today?")

        response = client.chat.completions.create(model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_input}
        ],
        max_tokens=150,
        temperature=0.7)
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating response from OpenAI: {e}")
        # Fallback to predefined response if OpenAI fails
        return fallback_response(user_input, context)

def fallback_response(user_input: str, context: str) -> str:
    """
    Provide a simple, predefined response based on context and keywords.
    """
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

def get_message(db: Session, message_id: int, user_id: int) -> Optional[models.Message]:
    return db.query(models.Message).filter(models.Message.id == message_id, models.Message.user_id == user_id).first()

def get_messages(db: Session, user_id: int, skip: int = 0, limit: int = 10) -> list[models.Message]:
    return db.query(models.Message).filter(models.Message.user_id == user_id).order_by(models.Message.timestamp.asc()).offset(skip).limit(limit).all()

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
