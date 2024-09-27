# backend/tests/test_crud.py

import pytest
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.message import Message  # Corrected import
from app.schemas.message import MessageCreate
from app.crud.message import create_message
# Add at the top of your test files
import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_create_message(db: Session, mock_openai):
    # Setup: Create a test user
    user = User(username="testuser", email="test@example.com", hashed_password="hashedpassword")
    db.add(user)
    db.commit()
    db.refresh(user)

    # Mock OpenAI response is already set in the fixture

    # Create a user message using MessageCreate schema
    message_data = MessageCreate(role="user", content="Hello", context="Onboarding")
    message = create_message(db, message_data, user_id=user.id)

    # Assertions for user message
    assert message.content == "Hello", "User message content mismatch"
    assert message.role == "user", "User message role mismatch"
    assert message.user_id == user.id, "User ID mismatch"
    assert message.context == "Onboarding", "Context mismatch"

    # Check assistant's response
    assistant_messages = db.query(Message).filter(
        Message.parent_id == message.id,
        Message.role == "assistant"
    ).all()
    
    # Assert that exactly one assistant message exists
    assert len(assistant_messages) == 1, f"Expected 1 assistant message, found {len(assistant_messages)}"

    # Assert that assistant's message content matches the mock
    assert assistant_messages[0].content == "Welcome to Artisan!", f"Expected 'Welcome to Artisan!', got '{assistant_messages[0].content}'"

    # Optional: Print the assistant's response for debugging
    logger.info(f"Assistant response: {assistant_messages[0].content}")

