from sqlalchemy import Column, Integer, String, DateTime, func
from config import Base
from sqlalchemy.orm import relationship
class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    photo = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    password_hash = Column(String)
    created_at = Column(DateTime, default=func.now())
    jwt_token = Column(String, nullable=True)

    
    posts = relationship("Post", back_populates="user", cascade="all, delete")
    comments = relationship("Comment", back_populates="user", cascade="all, delete")
    sent_messages = relationship("Message", back_populates="sender", foreign_keys="Message.sender_id")
    received_messages = relationship("Message", back_populates="receiver", foreign_keys="Message.receiver_id")
    likes = relationship("Like", back_populates="user", cascade="all, delete")
