from fastapi import APIRouter, Depends, HTTPException, Form
from Services.CommentService import *
from config import get_db
from dependencies import get_current_user
from models.userModels import User
from sqlalchemy.orm import Session

router = APIRouter()

@router.post("/comments/")
async def add_comment(
    content: str = Form(...),
    post_id: int = Form(...),
    db: Session = Depends(get_db),
    username: str = Depends(get_current_user)
):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Vérifier que le post existe
    from models.PostModels import Post as PostModel
    post = db.query(PostModel).filter(PostModel.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    comment = await create_comment(db, content=content, post_id=post_id, user_id=user.id)
    comment_user = db.query(User).filter(User.id == comment.user_id).first()
    return {
        'id': comment.id,
        'content': comment.content,
        'user': {'username': comment_user.username, 'photo': comment_user.photo, 'id': comment_user.id} if comment_user else None,
        'createdAt': str(comment.created_at) if hasattr(comment, 'created_at') else None
    }

@router.put("/comments/{comment_id}")
async def modify_comment(
    comment_id: int,
    content: str = Form(...),
    db: Session = Depends(get_db),
    username: str = Depends(get_current_user)
):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = CommentUpdate(content=content)
    return await update_comment(db, comment_id, update_data, current_user_id=user.id)

@router.delete("/comments/{comment_id}")
async def remove_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    username: str = Depends(get_current_user)
):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return await delete_comment(db, comment_id, current_user_id=user.id)
