from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from sqlalchemy.types import Enum as TYPE
from config import Base
from enum import Enum

# Define the possible types for the post
class PostTypeEnum(str, Enum):
    pdf = "pdf"
    image = "image"
    video = "video"
    texte="texte"

# Define the Post model
class Post(Base):
    __tablename__ = 'posts'

    id = Column(Integer, primary_key=True, index=True)  # Unique post identifier
    title = Column(String, index=True)  # Post title
    content = Column(String, nullable=True)  # Text content of the post (optional, mainly for "texte" posts)
    type = Column(TYPE(PostTypeEnum), nullable=False, index=True)
    created_at = Column(DateTime, default=func.now())  # Creation date of the post
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)  # Reference to the user (foreign key)
    file_url = Column(String, nullable=True)  # Path to the associated file (image, video, etc.)
    location = Column(String, nullable=True)  # Location (optional)

    # Relationship with the user
    user = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete")

