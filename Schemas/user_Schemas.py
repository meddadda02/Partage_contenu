from typing import Generic,Optional,TypeVar
from pydantic import BaseModel
from fastapi import UploadFile, File

T=TypeVar("T")

class Login(BaseModel):
    username:str
    password:str
    
class Register(BaseModel):
    username:str
    password:str
    email:str
    bio:Optional[str]
    
class ReponseSchema(BaseModel):
    code:str
    status:str
    message:str
    result: Optional[T]=str
    
class AccessToken(BaseModel):
    access:str
    token_type:str
    
class UserOut(BaseModel):
    username: str
    email: str
    bio: Optional[str]
    photo: Optional[str]

    class Config:
        from_orm = True

    def model_dump(self, *args, **kwargs):
        data = super().model_dump(*args, **kwargs)
        photo = data.get('photo')
        if photo and not photo.startswith('http'):
            data['photo'] = f"http://localhost:8000/images/{photo.split('/')[-1]}"
        return data


