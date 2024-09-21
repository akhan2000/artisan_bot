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
        user_history = " ".join([msg.content for msg in recent_messages if not msg.is_edited and not msg.is_deleted])

        # Define enhanced system prompts based on context with rich company and product details
        system_prompts = {
            "Onboarding": (
                f"Welcome to Artisan! We are pioneering the next Industrial Revolution by creating AI Employees called Artisans and consolidating essential sales tools into a single, exceptional platform. "
                f"Ava, our AI Business Development Representative (BDR), is designed to automate over 80% of the B2B outbound demand generation process. "
                f"She excels in lead discovery with access to over 300M B2B contacts, lead research from dozens of data sources, crafting and sending hyper-personalized emails, and managing deliverability with advanced tools like email warmup and placement tests. "
                f"Previous interactions: {user_history}. "
                f"You are Ava, an AI BDR within the Artisan platform. Guide the user through setting up the platform, demonstrate how to leverage Ava's capabilities for lead discovery, email personalization, and sales automation to enhance their outbound sales efforts."
            ),
            "Support": (
                f"Hello! At Artisan, we aim to streamline your sales workflows with our AI Employees and comprehensive automation tools. "
                f"Elijah, our AI Support Expert, specializes in troubleshooting and optimizing AI-powered sales workflows, ensuring seamless email deliverability, and integrating diverse data sources. "
                f"Previous interactions: {user_history}. "
                f"You are Elijah, an AI Support Expert at Artisan. Assist the user with any technical issues they encounter, provide step-by-step guidance on using Artisan's tools, and ensure their sales automation processes run smoothly."
            ),
            "Marketing": (
                f"Welcome to Artisan's Marketing Suite! We offer a unified platform that integrates AI-driven email sequences, extensive lead research, and the latest sales promotions to elevate your marketing strategies. "
                f"Lucas, our AI Marketing Strategist, provides insightful analytics, optimizes email campaigns, and offers strategic guidance to maximize your marketing ROI. "
                f"Previous interactions: {user_history}. "
                f"You are Lucas, an AI Marketing Strategist at Artisan. Provide the user with detailed insights into Artisan’s marketing solutions, demonstrate how to utilize AI-driven tools for email campaigns and lead research, and inform them about current promotions to enhance their marketing effectiveness."
            )
        }
  
        system_prompt = system_prompts.get(context, "You are an assistant. How can I assist you today?")

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_input}
        ]

        response = client.chat.completions.create(
            model="gpt-4",  
            messages=messages,
            max_tokens=500,  
            temperature=0.7 if context == "Marketing" else 0.5
        )
        return response.choices[0].message.content.strip()

    except Exception as e:
        print(f"Error generating response from OpenAI: {e}")
        # Fallback response in case of an error
        return fallback_response(user_input, context)


def handle_click_action(db: Session, user_id: int, action_type: str, context: str) -> models.Message:
    try:
        system_prompts = {
            "Onboarding": "You are Ava, an AI BDR specializing in B2B sales automation.",
            "Support": "You are Elijah, an AI support expert.",
            "Marketing": "You are Lucas, an AI marketing strategist.",
        }

        action_prompts = {
            "create_lead": "The user wants to create a new lead. Ask for the lead’s name and contact information.",
            "schedule_follow_up": "The user wants to schedule a follow-up. Ask for the date and time.",
            "generate_email_template": "The user wants to generate an email template. Ask for the recipient and subject."
        }

        system_prompt = system_prompts.get(context, "You are an assistant. How can I assist you today?")
        action_prompt = action_prompts.get(action_type, "How can I assist you today?")

        full_prompt = f"{system_prompt} {action_prompt}"

        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": full_prompt},
                {"role": "user", "content": ""}
            ],
            max_tokens=200,
            temperature=0.7 if context == "Marketing" else 0.5
        )

        assistant_response = response.choices[0].message.content.strip()

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

        return db_assistant_message

    except Exception as e:
        print(f"Error handling click action: {e}")
        # Fallback response in case of an error
        fallback = fallback_response("", context)
        db_assistant_message = models.Message(
            role="assistant",
            content=fallback,
            user_id=user_id,
            context=context
        )
        db.add(db_assistant_message)
        db.commit()
        db.refresh(db_assistant_message)
        return db_assistant_message


def get_message(db: Session, message_id: int, user_id: int) -> Optional[models.Message]:
    """
    Retrieve a single message by its ID and user ID.
    """
    return db.query(models.Message).filter(models.Message.id == message_id, models.Message.user_id == user_id).first()


def get_recent_messages_by_context(db: Session, user_id: int, context: str, limit: int = 5) -> list[models.Message]:
    """
    Fetch the most recent messages from the database for a given user and context.
    """
    return db.query(models.Message).filter(models.Message.user_id == user_id, models.Message.context == context).order_by(models.Message.timestamp.desc()).limit(limit).all()

def get_messages(db: Session, user_id: int, skip: int = 0, limit: int = 10, context: Optional[str] = None) -> list[models.Message]:
    """
    Fetch a list of messages for a user with optional context filtering.
    """
    query = db.query(models.Message).filter(
        models.Message.user_id == user_id,
        models.Message.is_edited==False,
        models.Message.is_deleted==False
        )
    if context:
        query = query.filter(models.Message.context == context)
    return query.order_by(models.Message.timestamp.asc()).offset(skip).limit(limit).all()

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
    

def delete_message(db: Session, message_id: int, user_id: int) -> Optional[models.Message]:
    message = db.query(models.Message).filter(models.Message.id == message_id, models.Message.user_id == user_id).first()
    if message:
        db.delete(message)
        db.commit()
    return message

def update_message(db: Session, message_id: int, new_content: str, user_id: int) -> Optional[models.Message]:
    message = db.query(models.Message).filter(models.Message.id == message_id, models.Message.user_id == user_id).first()
    if message:
        message.is_edited = True
        db.commit()
        db.refresh(message)

        edited_message = models.Message(
            role=message.role,
            content=new_content,
            user_id=user_id,
            context=message.context,
            is_edited=False,  # New message is not edited
        )
        db.add(edited_message)
        db.commit()
        db.refresh(edited_message)

        return edited_message
    return None 

