# backend/tests/test_database.py

import pytest
from sqlalchemy.orm import Session
import sqlalchemy
from app.models import User  # Ensure models are imported if needed

def test_users_table_exists(db: Session):
    inspector = sqlalchemy.inspect(db.bind)
    tables = inspector.get_table_names()
    assert "users" in tables, "Users table should exist in the database"
