from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from pydantic import BaseModel
from typing import Optional
from Schemas.user_Schemas import UserOut

class PostCreate(BaseModel):
    title: str
    content: Optional[str] = None
    type: str  # Peut être texte,image,video,pdf
    location: Optional[str] = None  # Localisation du post (facultatif)


class Post(BaseModel):
    user: UserOut  # Ajoute cette ligne

    id: int
    title: str
    content: Optional[str]
    type: str
    file_url: Optional[str]
    location: Optional[str]  
    created_at: datetime
    user_id: int

    class Config:
        from_attributes = True

    def model_dump(self, *args, **kwargs):
        data = super().model_dump(*args, **kwargs)
        user = data.get('user')
        if user and user.get('photo'):
            photo = user['photo']
            if photo and not photo.startswith('http'):
                user['photo'] = f"http://localhost:8000/images/{photo.split('/')[-1]}"
        return data

