from .database import SessionLocal, engine, Base
from .models.user import User
from .models.message import Message
from .auth import get_password_hash

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Create a test user
        test_user = db.query(User).filter(User.username == "testuser").first()
        if not test_user:
            test_user = User(
                username="testuser",
                email="testuser@example.com",
                hashed_password=get_password_hash("testpassword"),
                first_name="Test",
                last_name="User"
            )
            db.add(test_user)
            db.commit()
            db.refresh(test_user)
        
        # Create some test messages
        if not db.query(Message).filter(Message.user_id == test_user.id).first():
            messages = [
                Message(role="assistant", content="Welcome to the chatbot!", user_id=test_user.id),
                Message(role="user", content="Hello!", user_id=test_user.id),
                Message(role="assistant", content="How can I assist you today?", user_id=test_user.id),
            ]
            db.bulk_save_objects(messages)
            db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
    print("Database seeded successfully.")
