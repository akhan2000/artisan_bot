# backend/tests/test_api.py

import pytest
from fastapi import status
# Add at the top of your test files
import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)


def authenticate(client, username: str, password: str):
    """
    Helper function to register and login a user, returning the authorization headers.
    """
    # Register user
    response = client.post(
        "/register",
        json={
            "username": username,
            "password": password,
            "email": f"{username}@example.com",
            "first_name": "API",
            "last_name": "User"
        }
    )
    assert response.status_code == status.HTTP_200_OK

    # Login user
    response = client.post(
        "/login",
        data={"username": username, "password": password}
    )
    assert response.status_code == status.HTTP_200_OK
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_create_and_get_messages(client, mock_openai):
    headers = authenticate(client, "apiuser", "apipassword")

    # Mock OpenAI response is already set in the fixture

    # Create a message
    response = client.post(
        "/messages/",
        json={"role": "user", "content": "Hello", "context": "Onboarding"},
        headers=headers
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["content"] == "Hello"

    # Get messages
    response = client.get("/messages/", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    messages = response.json()
    assert len(messages) >= 2, f"Expected at least 2 messages, found {len(messages)}"

    # Assert user message
    user_message = messages[0]
    assert user_message["content"] == "Hello", "User message content mismatch"

    # Assert assistant message exists
    assistant_message = messages[1]
    assert assistant_message["role"] == "assistant", "Second message should be from assistant"
    assert assistant_message["content"], "Assistant response content is empty"

    # Optional: Print the assistant's response for debugging
    print(f"Assistant response: {assistant_message['content']}")
