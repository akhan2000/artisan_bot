# backend/tests/conftest.py

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.database import Base, get_db
from app.main import app
from unittest.mock import MagicMock
from app.models import User, Message  # Ensure all models are imported
# Add at the top of your test files
import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)


# Create an engine with a shared connection for in-memory SQLite
engine = create_engine(
    "sqlite:///:memory:", connect_args={"check_same_thread": False}
)

# Create a connection that persists for the entire test session
connection = engine.connect()

# Bind the sessionmaker to the shared connection
TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=connection
)

# Create all tables once
Base.metadata.create_all(bind=connection)

# Dependency override to use the testing database
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

# Apply the dependency override
app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session")
def client():
    """
    Fixture to provide a TestClient for the FastAPI app.
    """
    with TestClient(app) as c:
        yield c

@pytest.fixture(scope="session")
def db():
    """
    Fixture to provide a SQLAlchemy Session for database interactions.
    """
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture(autouse=True)
def setup_and_teardown():
    """
    Fixture to set up the database before each test and tear it down after.
    """
    # Setup: Drop all tables and recreate them
    Base.metadata.drop_all(bind=connection)
    Base.metadata.create_all(bind=connection)
    yield
    # Teardown: Drop all tables
    Base.metadata.drop_all(bind=connection)

@pytest.fixture
def mock_openai(mocker):
    """
    Fixture to mock the OpenAI API's ChatCompletion.create method.
    """
    # Adjust the import path based on your actual code structure
    mock = mocker.patch('app.crud.message.client.chat.completions.create')
    
    # Create a mock response object with the 'choices' attribute
    mock_response = MagicMock()
    mock_response.choices = [MagicMock(message=MagicMock(content="Welcome to Artisan!"))]
    mock.return_value = mock_response
    
    return mock