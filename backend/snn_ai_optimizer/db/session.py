from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database URL from environment variable
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./snn_optimizer.db")

from sqlalchemy.pool import NullPool

# Create engine
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=NullPool
    )
else:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)


# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()