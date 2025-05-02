from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from config import get_db
from Schemas.PostSchema import PostCreate, Post
from Services.PostServices import create_post_svc,get_posts_by_user_svc,delete_post,update_post
from dependencies import get_current_user
from models.userModels import User

router = APIRouter()

# Route pour créer un post avec fichier (image/vidéo)
@router.post("/posts/", response_model=Post)
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
    detected_type = type  # Valeur finale de type qu’on utilisera

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




@router.get("/posts/me", response_model=list[Post])
async def get_my_posts(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return await get_posts_by_user_svc(db=db, username=current_user)


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



@router.put("/posts/{post_id}", response_model=Post)
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
