import os
import sys
from pathlib import Path

# Remove database file
db_path = Path(__file__).parent / 'database.db'
if db_path.exists():
    os.remove(db_path)
    print(f"✅ Deleted old database: {db_path}")

# Clear all Python cache
import shutil
for cache_dir in Path(__file__).parent.rglob('__pycache__'):
    shutil.rmtree(cache_dir)
    print(f"✅ Cleared cache: {cache_dir}")

for pyc_file in Path(__file__).parent.rglob('*.pyc'):
    os.remove(pyc_file)
    print(f"✅ Deleted: {pyc_file}")

# Force reload modules
if 'models' in sys.modules:
    del sys.modules['models']
if 'database' in sys.modules:
    del sys.modules['database']

print("\n📦 Creating fresh database with current models...")

# Import fresh
from database import engine
from models import Base, Feedback
from sqlalchemy import inspect

# Drop all tables first (clean slate)
Base.metadata.drop_all(bind=engine)
print("✅ Dropped all existing tables")

# Create all tables from scratch
Base.metadata.create_all(bind=engine)
print("✅ Created all tables from scratch")

# Verify Feedback table structure
inspector = inspect(engine)
columns = inspector.get_columns('feedback')

print("\n📊 Feedback table columns:")
for col in columns:
    print(f"  - {col['name']}: {col['type']}")

# Check if comment column exists
has_comment = any(col['name'] == 'comment' for col in columns)

if has_comment:
    print("\n✅✅✅ SUCCESS! Comment column is now in the feedback table!")
else:
    print("\n❌ ERROR: Comment column is still missing!")
    print("\n🔍 Checking models.py for the comment line...")
    
    with open('models.py', 'r') as f:
        content = f.read()
        if 'comment = Column(Text, nullable=True)' in content:
            print("✅ Comment line IS in models.py")
            print("❌ But SQLAlchemy didn't create the column")
            print("\n🔧 This suggests a Python import caching issue.")
            print("   Try restarting your terminal/IDE completely.")
        else:
            print("❌ Comment line is NOT in models.py")
            print("   Please add this line to the Feedback class:")
            print("   comment = Column(Text, nullable=True)")
