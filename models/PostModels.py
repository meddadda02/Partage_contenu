from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from sqlalchemy.types import Enum as TYPE
from config import Base
from enum import Enum

class PostTypeEnum(str, Enum):
    pdf = "pdf"
    image = "image"
    video = "video"
    texte = "texte"

class Post(Base):
    __tablename__ = 'posts'

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, nullable=True)
    type = Column(TYPE(PostTypeEnum), nullable=True, index=True)  # Changed to nullable=True
    created_at = Column(DateTime, default=func.now())
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    file_url = Column(String, nullable=True)
    location = Column(String, nullable=True)

    user = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete")
    likes = relationship("Like", back_populates="post", cascade="all, delete")