from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.PostModels import Post
from models.userModels import User
from Schemas.PostSchema import PostCreate


async def create_post_svc(db: Session, post: Post, username: str, file_url: str):
    user = db.query(User).filter(User.username == username).first()
    
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Assurez-vous que le fichier est bien dans le bon format d'URL
    file_url_full = f"http://localhost:8000/images/{file_url.split('/')[-1]}" if file_url else None
    
    db_post = Post(
        title=post.title,
        content=post.content,
        type=post.type,
        user_id=user.id,  
        file_url=file_url_full,  # Stocke l'URL complet ici
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
    
    posts = db.query(Post).filter(Post.user_id == user.id).all()
    return posts

async def get_posts_by_type(db: Session, post_type: str):
    return db.query(Post).filter(Post.type == post_type).all()

async def delete_post(db: Session, post_id: int, current_user_id: int):
    # Recherche le commentaire par son ID
    post = db.query(Post).filter(Post.id == post_id).first()

    # Si le commentaire n'existe pas
    if not post:
        raise HTTPException(status_code=404, detail="post not found")

    # Vérification que l'utilisateur actuel est bien celui qui a créé le post
    if post.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")

    # Suppression du post
    db.delete(post)
    db.commit()

    return {"detail": "post successfully deleted"}


async def update_post(db: Session, post_id: int, post_data: PostCreate, current_user_id: int, file_url: str = None):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this post")

    post.title = post_data.title
    post.content = post_data.content
    post.type = post_data.type
    post.location = post_data.location
    if file_url:
        post.file_url = file_url

    db.commit()
    db.refresh(post)
    return post
