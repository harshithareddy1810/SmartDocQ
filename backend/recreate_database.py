import os
from database import engine
from models import Base

# Get database path
db_path = os.path.join(os.path.dirname(__file__), 'database.db')

print("🗑️  Removing old database...")
if os.path.exists(db_path):
    os.remove(db_path)
    print(f"✅ Deleted: {db_path}")
else:
    print(f"ℹ️  No existing database found at {db_path}")

print("\n📦 Creating new database with all tables...")
Base.metadata.create_all(bind=engine)

print("✅ Database created successfully!\n")

# Verify tables were created
from sqlalchemy import inspect
inspector = inspect(engine)
tables = inspector.get_table_names()

print(f"📋 Created tables: {', '.join(tables)}")

# Show feedback table structure
if 'feedback' in tables:
    print("\n📊 Feedback table columns:")
    for column in inspector.get_columns('feedback'):
        print(f"  - {column['name']}: {column['type']}")
else:
    print("\n⚠️  Warning: feedback table not found!")
