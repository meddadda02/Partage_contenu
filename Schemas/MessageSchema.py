from pydantic import BaseModel
from datetime import datetime

class MessageCreate(BaseModel):
    receiver_id: int
    content: str

class MessageOut(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    timestamp: datetime
    is_deleted_by_sender: bool
    is_deleted_by_receiver: bool

    class Config:
        orm_mode = True

class MessageUpdate(BaseModel):
    content: str

    class Config:
        orm_mode = True