from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from pydantic import BaseModel
from typing import Optional

class PostCreate(BaseModel):
    title: str
    content: Optional[str] = None
    type: str  # Peut être texte,image,video,pdf
    location: Optional[str] = None  # Localisation du post (facultatif)


class Post(BaseModel):
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
        
