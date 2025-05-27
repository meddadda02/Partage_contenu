from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.PostModels import Post as PostModel
from models.userModels import User
from Schemas.PostSchema import PostCreate, PostUpdate

async def create_post_svc(db: Session, post: PostCreate, username: str, file_url: str):
    user = db.query(User).filter(User.username == username).first()
    
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    file_url_full = f"http://localhost:8000/images/{file_url.split('/')[-1]}" if file_url else None
    
    db_post = PostModel(
        content=post.content,
        type=post.type,
        user_id=user.id,
        file_url=file_url_full,
        location=post.location,
    )
    
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

async def get_posts_by_user_svc(db: Session, username: str):
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    posts = db.query(PostModel).filter(PostModel.user_id == user.id).all()
    return posts

async def get_posts_by_type(db: Session, post_type: str):
    return db.query(PostModel).filter(PostModel.type == post_type).all()

async def delete_post(db: Session, post_id: int, current_user_id: int):
    post = db.query(PostModel).filter(PostModel.id == post_id).first()

    if not post:
        raise HTTPException(status_code=404, detail="post not found")

    if post.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")

    db.delete(post)
    db.commit()

    return {"detail": "post successfully deleted"}

async def update_post(db: Session, post_id: int, post_data: PostUpdate, current_user_id: int, file_url: str = None):
    post = db.query(PostModel).filter(PostModel.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this post")

    # Update only the fields that are provided (not None)
    if post_data.content is not None:
        post.content = post_data.content
    if post_data.type is not None:
        post.type = post_data.type
    if post_data.location is not None:
        post.location = post_data.location
    if file_url is not None:
        post.file_url = file_url

    db.commit()
    db.refresh(post)
    return post