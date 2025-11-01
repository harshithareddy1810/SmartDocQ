import re

print("🔍 Checking models.py file...\n")

with open('models.py', 'r') as f:
    content = f.read()

# Find Feedback class
feedback_match = re.search(r'class Feedback\(Base\):.*?(?=class \w+|$)', content, re.DOTALL)

if feedback_match:
    feedback_class = feedback_match.group(0)
    print("📋 Current Feedback class:")
    print("=" * 60)
    # Print just the class definition (first 20 lines or until next class)
    lines = feedback_class.split('\n')[:20]
    for i, line in enumerate(lines, 1):
        print(f"{i:2d}: {line}")
    print("=" * 60)
    
    # Check for comment field
    if 'comment = Column(Text, nullable=True)' in feedback_class:
        print("\n✅ FOUND: comment = Column(Text, nullable=True)")
    else:
        print("\n❌ MISSING: comment = Column(Text, nullable=True)")
        print("\n🔧 The Feedback class should have this line:")
        print("    comment = Column(Text, nullable=True)")
        print("\n   It should be between 'note' and 'created_at' lines")
else:
    print("❌ Could not find Feedback class in models.py")
