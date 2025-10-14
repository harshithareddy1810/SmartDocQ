import sqlite3
from pathlib import Path

db_path = Path(__file__).parent / "smartdoc.db"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Add role column if it doesn't exist
    cursor.execute("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'student'")
    print("✅ Added 'role' column to users table")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e).lower():
        print("ℹ️ 'role' column already exists")
    else:
        print(f"⚠️ Error adding role column: {e}")

try:
    # Add created_at column if it doesn't exist
    cursor.execute("ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    print("✅ Added 'created_at' column to users table")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e).lower():
        print("ℹ️ 'created_at' column already exists")
    else:
        print(f"⚠️ Error adding created_at column: {e}")

conn.commit()
conn.close()

print("\n✅ Database migration completed!")
