import sqlite3
import os

# Get the path to database.db
db_path = os.path.join(os.path.dirname(__file__), 'database.db')

# Connect to database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print(f"📂 Connected to database: {db_path}")

try:
    # Check if column already exists
    cursor.execute("PRAGMA table_info(feedback)")
    columns = [column[1] for column in cursor.fetchall()]
    
    if 'comment' in columns:
        print("⚠️  Column 'comment' already exists in feedback table")
    else:
        # Add comment column to feedback table
        cursor.execute('ALTER TABLE feedback ADD COLUMN comment TEXT')
        conn.commit()
        print("✅ Successfully added 'comment' column to feedback table")
        
        # Verify it was added
        cursor.execute("PRAGMA table_info(feedback)")
        columns = [column[1] for column in cursor.fetchall()]
        print(f"📋 Feedback table columns: {', '.join(columns)}")
        
except sqlite3.OperationalError as e:
    print(f"❌ Error: {e}")
except Exception as e:
    print(f"❌ Unexpected error: {e}")
finally:
    conn.close()
    print("✅ Database connection closed")
