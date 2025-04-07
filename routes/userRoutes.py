import os
import shutil
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Form, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from Schemas.user_Schemas import *
from config import get_db, secret_key, algorithm
from Services.user_Services import *
from models.userModels import User as DBUser

router = APIRouter(tags=["Authentification"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def save_image(file: UploadFile, directory: str = "uploads"):
    try:
        os.makedirs(directory, exist_ok=True)
        filename = file.filename

        if not filename or '.' not in filename:
            raise ValueError("Invalid file name")

        ext = filename.split('.')[-1]
        unique_name = f"{uuid.uuid4()}.{ext}"
        path = os.path.join(directory, unique_name)

        with open(path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return path

    except Exception as e:
        print("Erreur dans save_image:", e)
        raise HTTPException(status_code=400, detail="Invalid image upload")


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
        _user = UserRepo.find_by_username(db, DBUser, username)
        if not _user:
            raise HTTPException(status_code=404, detail="User not found")

        if not pwd_context.verify(password, _user.password_hash):
            raise HTTPException(status_code=400, detail="Invalid password")

        token = JWTRepo.generate_token({'sub': _user.username})

        # Swagger-friendly response
        return {
            "access_token": token,
            "token_type": "bearer"
        }

    except Exception as error:
        print(error.args)
        raise HTTPException(status_code=500, detail="Internal server error")


    except Exception as error:
        print(error.args)
        raise HTTPException(status_code=500, detail="Internal server error")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, secret_key, algorithms=[algorithm])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        return username
    except JWTError:
        raise credentials_exception

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



