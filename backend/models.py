# from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, func
# from sqlalchemy.orm import relationship, DeclarativeBase

# class Base(DeclarativeBase):
#     pass

# class User(Base):
#     __tablename__ = "users"
#     id = Column(Integer, primary_key=True, index=True)
#     name = Column(String)
#     email = Column(String, unique=True, index=True)
#     hashed_password = Column(String, nullable=True)
#     role = Column(String, default='student')
#     # user_id = Column(Integer, ForeignKey("users.id"))

    
#     # This line tells the User model that it has a relationship with Document
#     documents = relationship("Document", back_populates="owner")

# class Document(Base):
#     __tablename__ = "documents"
#     id = Column(Integer, primary_key=True, index=True)
#     filename = Column(String)
#     text = Column(Text)
#     created_at = Column(DateTime(timezone=False), server_default=func.now())
#     user_id = Column(Integer, ForeignKey("users.id"))
    
#     # owner_id = Column(Integer, ForeignKey("users.id"))
    
#     # This line completes the relationship, linking back to the User model
#     owner = relationship("User", back_populates="documents")

# class Chunk(Base):
#     __tablename__ = "chunks"

#     id = Column(Integer, primary_key=True, index=True)
#     document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), index=True)
#     seq = Column(Integer)
#     snippet = Column(Text)
#     created_at = Column(DateTime(timezone=False), server_default=func.now())

# class Session(Base):
#     __tablename__ = "sessions"

#     id = Column(Integer, primary_key=True, index=True)
#     session_id = Column(String(64), index=True)
#     created_at = Column(DateTime(timezone=False), server_default=func.now())

# class Message(Base):
#     __tablename__ = "messages"

#     id = Column(Integer, primary_key=True, index=True)
#     session_id_fk = Column(Integer, ForeignKey("sessions.id", ondelete="SET NULL"), nullable=True)
#     document_id = Column(Integer, ForeignKey("documents.id"))
#     role = Column(String(16))  # 'user' | 'assistant'
#     content = Column(Text)
#     created_at = Column(DateTime(timezone=False), server_default=func.now())

# class Feedback(Base):
#     __tablename__ = "feedback"

#     id = Column(Integer, primary_key=True, index=True)
#     message_id = Column(Integer, ForeignKey("messages.id", ondelete="CASCADE"), index=True)
#     rating = Column(String(8))  # 'up' | 'down'
#     note = Column(Text, nullable=True)
#     created_at = Column(DateTime(timezone=False), server_default=func.now())


from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, func
from sqlalchemy.orm import relationship, DeclarativeBase
from datetime import datetime
import secrets

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)
    role = Column(String, default="student")  # Add role field: "student" or "admin"
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to documents
    documents = relationship("Document", back_populates="owner")

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    text = Column(Text)
    created_at = Column(DateTime(timezone=False), server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="documents")

class Chunk(Base):
    __tablename__ = "chunks"
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), index=True)
    seq = Column(Integer)
    snippet = Column(Text)
    created_at = Column(DateTime(timezone=False), server_default=func.now())

class Session(Base):
    __tablename__ = "sessions"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(64), index=True)
    created_at = Column(DateTime(timezone=False), server_default=func.now())

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    session_id_fk = Column(Integer, ForeignKey("sessions.id", ondelete="SET NULL"), nullable=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    role = Column(String(16))  # 'user' | 'assistant'
    content = Column(Text)
    created_at = Column(DateTime(timezone=False), server_default=func.now())

class Feedback(Base):
    __tablename__ = "feedback"
    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id", ondelete="CASCADE"), index=True)
    rating = Column(String(8))  # 'up' | 'down'
    note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=False), server_default=func.now())

class SharedConversation(Base):
    __tablename__ = "shared_conversations"
    id = Column(Integer, primary_key=True, index=True)
    share_id = Column(String(32), unique=True, index=True, nullable=False, default=lambda: secrets.token_urlsafe(16))
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), index=True)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=False), server_default=func.now())
    expires_at = Column(DateTime(timezone=False), nullable=True)
    is_active = Column(Integer, default=1)  # 1 = active, 0 = disabled
