from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from models.userModels import User
from config import get_db
from config import secret_key,algorithm # Adapte à ta configuration

# Déclare la méthode OAuth2 pour l'authentification
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Cette fonction va valider le token et récupérer l'utilisateur connecté
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
