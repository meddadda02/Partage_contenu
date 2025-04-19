from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from config import get_db
from Schemas.PostSchema import PostCreate, Post
from Services.PostServices import create_post_svc
from dependencies import get_current_user

router = APIRouter()

# Route pour créer un post avec fichier (image/vidéo)
@router.post("/posts/", response_model=Post)
async def create_post(
    title: str = Form(...),
    content: str = Form(None),
    type: str = Form(...),
    location: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),  #le nom d'utilisateur connecte
):

    file_extension = file.filename.split(".")[-1].lower()
    allowed_extensions = ["jpg", "jpeg", "png", "gif", "mp4", "avi"]
    
    if file_extension not in allowed_extensions:
        raise HTTPException(status_code=400, detail="File type not supported")

    # Enregistrer le fichier sur le serveur
    file_location = f"uploads/{file.filename}"
    with open(file_location, "wb") as f:
        f.write(file.file.read())

    # Créer un post avec les informations du formulaire et le fichier
    post = PostCreate(
        title=title,
        content=content,
        type=type,
        location=location,
    )
    
    # Appeler la fonction de service avec le username
    return await create_post_svc(db=db, post=post, username=current_user, file_url=file_location)
