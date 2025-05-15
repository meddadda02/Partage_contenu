from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint, func
from sqlalchemy.orm import relationship
from config import Base

class Like(Base):
    __tablename__ = 'likes'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    post_id = Column(Integer, ForeignKey('posts.id'), nullable=False)
    created_at = Column(DateTime, default=func.now())

    # Relationship with the user and post
    user = relationship("User", back_populates="likes")
    post = relationship("Post", back_populates="likes")

    # Ensure a user can only like a post once
    __table_args__ = (
        UniqueConstraint('user_id', 'post_id', name='unique_user_post_like'),
    )
