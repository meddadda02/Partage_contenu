from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from config import get_db
from Services.LikeServices import add_like, remove_like, get_post_likes, has_user_liked_post
from dependencies import get_current_user
from models.userModels import User

router = APIRouter()

@router.post("/posts/{post_id}/like")
async def like_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    user = db.query(User).filter(User.username == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return await add_like(db, post_id, user.id)

@router.delete("/posts/{post_id}/like")
async def unlike_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    user = db.query(User).filter(User.username == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return await remove_like(db, post_id, user.id)

@router.get("/posts/{post_id}/likes")
async def get_likes(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    likes = await get_post_likes(db, post_id)
    return likes

@router.get("/posts/{post_id}/liked")
async def check_if_liked(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    user = db.query(User).filter(User.username == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    has_liked = await has_user_liked_post(db, post_id, user.id)
    return {"has_liked": has_liked}
