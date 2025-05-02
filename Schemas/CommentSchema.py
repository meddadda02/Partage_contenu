from pydantic import BaseModel
from datetime import datetime

class CommentCreate(BaseModel):
    content: str
    post_id: int

class CommentResponse(BaseModel):
    id: int
    content: str
    created_at: datetime
    user_id: int
    post_id: int

    class Config:
        from_attributes = True
