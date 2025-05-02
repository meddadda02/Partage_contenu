from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from Schemas.MessgeSchema import MessageCreate, MessageOut
from Services.MessageServices import send_message, get_messages, get_conversation
from config import get_db
from dependencies import get_current_user  # récupère le username à partir du token
from models.userModels import User

router = APIRouter(prefix="/messages", tags=["Messages"])

@router.post("/", response_model=MessageOut)
async def send_new_message(
    message: MessageCreate,
    db: Session = Depends(get_db),
    current_username: str = Depends(get_current_user)
):
    sender = db.query(User).filter(User.username == current_username).first()
    if not sender:
        raise HTTPException(status_code=404, detail="Sender not found")

    return send_message(db, sender.id, message)

@router.get("/", response_model=list[MessageOut])
async def read_all_messages(
    db: Session = Depends(get_db),
    current_username: str = Depends(get_current_user)
):
    user = db.query(User).filter(User.username == current_username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return get_messages(db, user.id)

@router.get("/conversation/{other_user_id}", response_model=list[MessageOut])
async def read_conversation(
    other_user_id: int,
    db: Session = Depends(get_db),
    current_username: str = Depends(get_current_user)
):
    user = db.query(User).filter(User.username == current_username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return get_conversation(db, user.id, other_user_id)
