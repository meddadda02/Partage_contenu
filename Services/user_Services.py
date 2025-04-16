import os
import shutil
from typing import Generic, Optional, TypeVar
import uuid
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import ExpiredSignatureError, JWTError, jwt
from fastapi import HTTPException, UploadFile
from config import secret_key, algorithm

T = TypeVar("T")

class BaseRepo():
    @staticmethod
    def insert(db: Session, model: Generic[T]):
        db.add(model)
        db.commit()
        db.refresh(model)

class UserRepo(BaseRepo):
    @staticmethod
    def find_by_username(db: Session, model: Generic[T], username: str):
        return db.query(model).filter(model.username == username).first()

class JWTRepo():
    @staticmethod
    def generate_token(data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)  # Duree dexpiration par defaut 15 minutes
        to_encode.update({"exp": expire})
        encode_jwt = jwt.encode(to_encode, secret_key, algorithm=algorithm)
        return encode_jwt

    @staticmethod
    def decode_token(token: str):
        try:
            decoded_token = jwt.decode(token, secret_key, algorithms=[algorithm])
            return decoded_token
        except ExpiredSignatureError:
            # Token expiré
            raise HTTPException(status_code=401, detail="Token has expired")
        except JWTError:
            # Token invalide
            raise HTTPException(status_code=401, detail="Invalid token")
        
    def verify_token(token: str):
        # Utilisation de decode_token pour verifier le token
        decoded_token = JWTRepo.decode_token(token)
        if decoded_token is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return decoded_token

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
