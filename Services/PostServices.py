from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.PostModels import Post
from models.userModels import User

async def create_post_svc(db: Session, post: Post, username: str, file_url: str):
    # Récupérer l'utilisateur basé sur le username
    user = db.query(User).filter(User.username == username).first()
    
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Créer le post avec user_id au lieu de username
    db_post = Post(
        title=post.title,
        content=post.content,
        type=post.type,
        user_id=user.id,  # Utilise user_id ici
        file_url=file_url,
        location=post.location,
    )
    
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

async def getPost(db: Session, username: str):
    user = db.query(User).filter(User.username == username).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    posts = db.query(Post).filter(Post.user_id == user.id).all()
    return posts