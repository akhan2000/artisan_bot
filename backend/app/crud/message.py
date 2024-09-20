from sqlalchemy.orm import Session
from openai import OpenAI
import os
from .. import models, schemas
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Load key from .env
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OpenAI API key not found. Please set the OPENAI_API_KEY environment variable.")

client = OpenAI(api_key=OPENAI_API_KEY)

def create_message(db: Session, message: schemas.MessageCreate, user_id: int):
    # Create and store the user message
    db_message = models.Message(**message.dict(), user_id=user_id)
    db.add(db_message)
    db.commit()
    db.refresh(db_message)

    # Generate assistant response based on context and user history
    context = db_message.context
    assistant_response = generate_response(db_message.content, context, db, user_id)

    # Create and store the assistant's message
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

def generate_response(user_input: str, context: str, db: Session, user_id: int, history_limit: int = 5) -> str:
    """
    Generate a response based on the user input, context, and recent user history using OpenAI's ChatCompletion.
    """
    try:
        # Fetch recent chat history specific to the context (e.g., Onboarding, Support, Marketing)
        recent_messages = get_recent_messages_by_context(db, user_id, context=context, limit=history_limit)
        user_history = " ".join([msg.content for msg in recent_messages])

        # Define system prompts based on context and user history
        system_prompts = {
            "Onboarding": (
                f"You are Ava, an AI BDR specializing in B2B sales automation. Previous history: {user_history}. "
                "Welcome the user, guide them through the platform setup, and highlight how to automate lead discovery and email personalization."
            ),
            "Support": (
                f"You are Elijah, an AI support expert. Previous history: {user_history}. "
                "Assist the user with troubleshooting issues related to AI-powered sales workflows, email deliverability, or data integration."
            ),
            "Marketing": (
                f"You are Lucas, an AI marketing strategist. Previous history: {user_history}. "
                "Provide insights into Artisan’s sales solutions, including AI-driven email sequences, lead research, and current promotions."
            )
        }

        # Select the system prompt based on context
        system_prompt = system_prompts.get(context, "You are an assistant. How can I assist you today?")

        # Make the API call to OpenAI with recent history and current input
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
        # Fallback response
        return fallback_response(user_input, context)

# Updated helper function to fetch recent messages for the specific context
def get_recent_messages_by_context(db: Session, user_id: int, context: str, limit: int = 5) -> list[models.Message]:
    """
    Fetch the most recent messages from the database for a given user and context.
    """
    return db.query(models.Message).filter(models.Message.user_id == user_id, models.Message.context == context).order_by(models.Message.timestamp.desc()).limit(limit).all()

# Existing helper function for getting messages without context filtering
def get_messages(db: Session, user_id: int, skip: int = 0, limit: int = 10) -> list[models.Message]:
    """
    Fetch a list of messages for a user without filtering by context.
    """
    return db.query(models.Message).filter(models.Message.user_id == user_id).order_by(models.Message.timestamp.asc()).offset(skip).limit(limit).all()

def fallback_response(user_input: str, context: str) -> str:
    """
    Provide a simple, predefined fallback response.
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
    


def handle_click_action(db: Session, user_id: int, action_type: str, context: str) -> str:
    try:
        system_prompts = {
            "Onboarding": "You are Ava, an AI BDR specializing in B2B sales automation.",
            "Support": "You are Elijah, an AI support expert.",
            "Marketing": "You are Lucas, an AI marketing strategist.",
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
                {"role": "user", "content": ""}
            ],
            max_tokens=200,
            temperature=0.7 if context == "Marketing" else 0.5
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        print(f"Error handling click action: {e}")
        return fallback_response("", context)

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
