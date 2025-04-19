from fastapi import APIRouter, Depends, HTTPException
from Schemas.CommentSchema import CommentCreate
from Services.CommentService import create_comment
from config import get_db
from dependencies import get_current_user
from models.userModels import User
from sqlalchemy.orm import Session

router = APIRouter()

@router.post("/comments/")
async def add_comment(comment: CommentCreate, db: Session = Depends(get_db), username: str = Depends(get_current_user)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return await create_comment(db, content=comment.content, post_id=comment.post_id, user_id=user.id)
