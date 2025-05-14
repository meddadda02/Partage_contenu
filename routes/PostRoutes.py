from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from config import get_db
from Schemas.PostSchema import PostCreate, Post as PostSchema  # Renommé pour éviter la confusion
from models.PostModels import Post as PostModel  # Importation explicite du modèle SQLAlchemy
from Services.PostServices import create_post_svc, get_posts_by_user_svc, delete_post, update_post
from Services.CommentService import get_comments_by_post, create_comment, delete_comment
from dependencies import get_current_user
from models.userModels import User
from models.CommentModels import Comment

router = APIRouter()

# Route pour créer un post avec fichier (image/vidéo)
@router.post("/posts/", response_model=PostSchema)
async def create_post(
    title: str = Form(...),
    content: str = Form(None),
    type: str = Form(...),
    location: str = Form(None),
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    file_location = None
    detected_type = type  # Valeur finale de type qu'on utilisera

    if file:
        file_extension = file.filename.split(".")[-1].lower()
        allowed_extensions = {
            "jpg": "image", "jpeg": "image", "png": "image", "gif": "image",
            "mp4": "video", "avi": "video",
            "pdf": "pdf"
        }

        if file_extension not in allowed_extensions:
            raise HTTPException(status_code=400, detail="File type not supported")

        # Déduire le type si non fourni
        if not type:
            detected_type = allowed_extensions[file_extension]

        file_location = f"uploads/{file.filename}"
        with open(file_location, "wb") as f:
            f.write(file.file.read())

    # Vérifie que type est défini si on a un fichier
    if file and not detected_type:
        raise HTTPException(status_code=400, detail="Post type is required when uploading a file.")

    # Vérifie que type est défini si nécessaire par la BDD
    if not file and not detected_type:
        # Définis un type par défaut (optionnel) ou déclenche une erreur si la BDD exige ce champ
        raise HTTPException(status_code=400, detail="Post type is required.")

    post = PostCreate(
        title=title,
        content=content,
        type=detected_type,
        location=location,
    )

    return await create_post_svc(db=db, post=post, username=current_user, file_url=file_location)


@router.get("/posts")
async def get_all_posts(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    # Utiliser le modèle SQLAlchemy pour la requête
    posts = db.query(PostModel).order_by(PostModel.id.desc()).all()
    result = []
    for post in posts:
        user = db.query(User).filter(User.id == post.user_id).first()
        comments = await get_comments_by_post(db, post.id)
        comments_data = []
        for comment in comments:
            comment_user = db.query(User).filter(User.id == comment.user_id).first()
            comments_data.append({
                'id': comment.id,
                'content': comment.content,
                'user': {'username': comment_user.username, 'photo': comment_user.photo} if comment_user else None
            })
        file_url = post.file_url
        if file_url and not file_url.startswith('http'):
            file_url = f"http://localhost:8000/images/{file_url.split('/')[-1]}"
        post_data = {
            'id': post.id,
            'title': post.title,
            'content': post.content,
            'type': post.type,
            'file_url': file_url,  # <-- file_url ici
            'location': post.location,
            'created_at': post.created_at.isoformat() if hasattr(post, 'created_at') and post.created_at else None,
            'user': {'username': user.username, 'photo': user.photo} if user else None,
            'comments': comments_data
        }
        result.append(post_data)
    return result


@router.get("/posts/me")
async def get_my_posts(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    posts = await get_posts_by_user_svc(db=db, username=current_user)
    result = []
    for post in posts:
        user = db.query(User).filter(User.id == post.user_id).first()
        comments = await get_comments_by_post(db, post.id)
        comments_data = []
        for comment in comments:
            comment_user = db.query(User).filter(User.id == comment.user_id).first()
            comments_data.append({
                'id': comment.id,
                'content': comment.content,
                'user': {'username': comment_user.username, 'photo': comment_user.photo} if comment_user else None
            })
        file_url = post.file_url
        if file_url and not file_url.startswith('http'):
            file_url = f"http://localhost:8000/images/{file_url.split('/')[-1]}"
        post_data = {
            'id': post.id,
            'title': post.title,
            'content': post.content,
            'type': post.type,
            'file_url': file_url,  # <-- Correction ici : file_url
            'location': post.location,
            'created_at': post.created_at.isoformat() if hasattr(post, 'created_at') and post.created_at else None,
            'user': {'username': user.username, 'photo': user.photo} if user else None,
            'comments': comments_data
        }
        result.append(post_data)
    return result


@router.delete("/posts/{post_id}")
async def remove_post(
    post_id: int,
    db: Session = Depends(get_db),
    username: str = Depends(get_current_user)
):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return await delete_post(db, post_id, current_user_id=user.id)


@router.put("/posts/{post_id}", response_model=PostSchema)
async def edit_post(
    post_id: int,
    title: str = Form(...),
    content: str = Form(None),
    type: str = Form(...),
    location: str = Form(None),
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    user = db.query(User).filter(User.username == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    file_location = None
    detected_type = type

    if file:
        file_extension = file.filename.split(".")[-1].lower()
        allowed_extensions = {
            "jpg": "image", "jpeg": "image", "png": "image", "gif": "image",
            "mp4": "video", "avi": "video",
            "pdf": "pdf"
        }

        if file_extension not in allowed_extensions:
            raise HTTPException(status_code=400, detail="File type not supported")

        if not type:
            detected_type = allowed_extensions[file_extension]

        file_location = f"uploads/{file.filename}"
        with open(file_location, "wb") as f:
            f.write(file.file.read())

    post_data = PostCreate(
        title=title,
        content=content,
        type=detected_type,
        location=location
    )

    return await update_post(db, post_id=post_id, post_data=post_data, current_user_id=user.id, file_url=file_location)


@router.post("/posts/{post_id}/comments/")
async def add_comment_to_post(
    post_id: int,
    content: str = Form(...),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    user = db.query(User).filter(User.username == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Vérifier que le post existe
    post = db.query(PostModel).filter(PostModel.id == post_id).first()  # Utiliser PostModel ici
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    comment = await create_comment(db, content=content, post_id=post_id, user_id=user.id)
    comment_user = db.query(User).filter(User.id == comment.user_id).first()
    return {
        'id': comment.id,
        'content': comment.content,
        'user': {'username': comment_user.username, 'photo': comment_user.photo, 'id': comment_user.id} if comment_user else None
    }

@router.delete("/posts/{post_id}/comments/{comment_id}/")
async def delete_comment_from_post(
    post_id: int,
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    user = db.query(User).filter(User.username == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return await delete_comment(db, comment_id, current_user_id=user.id)
