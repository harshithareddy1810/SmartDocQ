# backend/init_db.py
from dotenv import load_dotenv

# Load environment variables from .env file FIRST
load_dotenv()

# FIXED: Changed 'database' to 'db' to match your actual file name
from db import engine, Base 
from models import User 

print("Connecting to the database and creating tables...")

# This command creates all tables defined in your models
Base.metadata.create_all(bind=engine)

print("Tables created successfully.")