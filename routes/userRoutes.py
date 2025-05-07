
from typing import Optional

from fastapi import APIRouter, Depends, Form, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from fastapi.middleware.cors import CORSMiddleware

from Schemas.user_Schemas import *
from config import get_db
from Services.user_Services import *
from models.userModels import User as DBUser
from dependencies import get_current_user


router = APIRouter(tags=["Authentification"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Inscription d'un utilisateur
@router.post("/signup")
async def signup(
    username: str = Form(...),
    password: str = Form(...),
    email: str = Form(...),
    bio: str = Form(None),
    photo: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    try:
        # Vérifier si l'utilisateur existe déjà
        existing_user = UserRepo.find_by_username(db, DBUser, username)
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already exists")

        # Hachage du mot de passe
        hashed_password = pwd_context.hash(password)

        # Sauvegarde de l'image si elle existe
        photo_path = None
        if photo :
            print("Photo reçue:", photo.filename)
            photo_path = save_image(photo)

        # Création de l'utilisateur
        new_user = DBUser(
            username=username,
            password_hash=hashed_password,
            email=email,
            photo=photo_path,
            bio=bio,
        )

        # Enregistrement de l'utilisateur dans la base de données
        UserRepo.insert(db, new_user)

        return ReponseSchema(code="200", status="ok", message="User successfully registered").dict(exclude_unset=True)

    except Exception as e:
        print("Error:", e)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/login")
async def login(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    try:
        # Vérifier si l'utilisateur existe
        _user = UserRepo.find_by_username(db, DBUser, username)
        if not _user:
            raise HTTPException(status_code=404, detail="User not found")

        # Vérifier le mot de passe
        if not pwd_context.verify(password, _user.password_hash):
            raise HTTPException(status_code=400, detail="Invalid password")

        # Générer un nouveau token JWT
        token = JWTRepo.generate_token({'sub': _user.username})

        # Sauvegarder le token dans la base de données
        _user.jwt_token = token  # Mise à jour du champ `jwt_token`
        db.commit()  # Enregistrer les modifications dans la base de données

        # Retourner le token JWT au frontend
        return {
            "access_token": token,
            "token_type": "bearer"
        }

    except HTTPException as http_error:
        # Gestion spécifique des exceptions HTTP
        print(http_error.args)
        raise http_error
    except Exception as error:
        # Gérer les erreurs internes
        print(error.args)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/users/me", response_model=UserOut)
def get_user_me(db: Session = Depends(get_db), current_username: str = Depends(get_current_user)):
    try:
        user = db.query(DBUser).filter(DBUser.username == current_username).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return UserOut(
            username=user.username,
            email=user.email,
            bio=user.bio,
            photo=user.photo
        )
    except Exception as e:
        print("Error:", e)
        raise HTTPException(status_code=500, detail="Internal server error")
    
    
@router.delete("/user/me")
def delete_user_connect(db:Session=Depends(get_db),current_username:str=Depends(get_current_user)):
    user=db.query(DBUser).filter(DBUser.username==current_username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

@router.put("/user/me")
def put_user_connect(
    username: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    bio: Optional[str] = Form(None),
    New_password: Optional[str] = Form(None),
    photo: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_username: str = Depends(get_current_user)
):
    user = db.query(DBUser).filter(DBUser.username == current_username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if username:
        user.username = username
    if email:
        user.email = email
    if bio:
        user.bio = bio
    if New_password:  
        hashed_password = pwd_context.hash(New_password)
        user.password_hash = hashed_password
    if photo:
        photo_path = save_image(photo)
        user.photo = photo_path

    db.commit()
    db.refresh(user)

    return {
        "message": "User updated successfully",
        "user": {
            "username": user.username,
            "email": user.email,
            "bio": user.bio,
            "photo": user.photo
        }
    }



