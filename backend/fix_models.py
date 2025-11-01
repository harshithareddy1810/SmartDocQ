import re

# Read the current models.py
with open('models.py', 'r') as f:
    content = f.read()

# Find the Feedback class and fix it
# Remove any duplicate comment lines first
content = re.sub(r'comment = Column\(Text, nullable=True\)\s+comment = Column\(Text, nullable=True\)', 
                 'comment = Column(Text, nullable=True)', content)

# Check if comment line exists
if 'comment = Column(Text, nullable=True)' not in content:
    # Find the note line in Feedback class and add comment after it
    pattern = r'(class Feedback\(Base\):.*?note = Column\(Text, nullable=True\))'
    replacement = r'\1\n    comment = Column(Text, nullable=True)'
    content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    print("✅ Added comment field to Feedback class")
else:
    print("✅ Comment field already exists")

# Write back
with open('models.py', 'w') as f:
    f.write(content)

print("✅ models.py has been fixed")

# Verify
with open('models.py', 'r') as f:
    if 'comment = Column(Text, nullable=True)' in f.read():
        print("✅ Verified: comment field is now in models.py")
    else:
        print("❌ Error: comment field is still missing")
