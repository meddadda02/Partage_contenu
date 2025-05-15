from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from models.LikeModels import Like
from models.PostModels import Post
from models.userModels import User

async def add_like(db: Session, post_id: int, user_id: int):
    # Check if post exists
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check if user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if user already liked this post
    existing_like = db.query(Like).filter(
        Like.user_id == user_id,
        Like.post_id == post_id
    ).first()
    
    if existing_like:
        raise HTTPException(status_code=400, detail="User already liked this post")
    
    # Create new like
    new_like = Like(user_id=user_id, post_id=post_id)
    
    try:
        db.add(new_like)
        db.commit()
        db.refresh(new_like)
        return new_like
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="User already liked this post")

async def remove_like(db: Session, post_id: int, user_id: int):
    # Find the like
    like = db.query(Like).filter(
        Like.user_id == user_id,
        Like.post_id == post_id
    ).first()
    
    if not like:
        raise HTTPException(status_code=404, detail="Like not found")
    
    # Delete the like
    db.delete(like)
    db.commit()
    return {"detail": "Like removed successfully"}

async def get_post_likes(db: Session, post_id: int):
    # Check if post exists
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Get all likes for the post
    likes = db.query(Like).filter(Like.post_id == post_id).all()
    return likes

async def has_user_liked_post(db: Session, post_id: int, user_id: int):
    # Check if user has liked the post
    like = db.query(Like).filter(
        Like.user_id == user_id,
        Like.post_id == post_id
    ).first()
    
    return like is not None
