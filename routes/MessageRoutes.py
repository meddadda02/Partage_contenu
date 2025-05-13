from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from Schemas.MessageSchema import MessageCreate, MessageOut, MessageUpdate
from Services.MessageServices import (
    send_message,
    get_conversation,
    delete_conversation,
    delete_single_message,
    update_message  # ✅ Added import for update function
)
from config import get_db
from dependencies import get_current_user
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

@router.delete("/conversation/{other_user_id}")
async def remove_conversation(
    other_user_id: int,
    db: Session = Depends(get_db),
    current_username: str = Depends(get_current_user)
):
    user = db.query(User).filter(User.username == current_username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return delete_conversation(db, user.id, other_user_id)

@router.put("/{message_id}", response_model=MessageOut)
async def update_existing_message(
    message_id: int,
    message_update: MessageUpdate,
    db: Session = Depends(get_db),
    current_username: str = Depends(get_current_user)
):
    user = db.query(User).filter(User.username == current_username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return update_message(db, message_id, user.id, message_update.content)

@router.delete("/message/{message_id}/soft")
async def soft_delete_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_username: str = Depends(get_current_user)
):
    user = db.query(User).filter(User.username == current_username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    result = delete_single_message(db, user.id, message_id)
    if result["detail"]:
        return {"detail": f"Message {message_id} supprimé de façon douce."}
    else:
        raise HTTPException(status_code=400, detail="Impossible de supprimer ce message.")

@router.get("/users/search/", response_model=list[dict])
async def search_users(
    q: str = Query(None),
    db: Session = Depends(get_db),
    current_username: str = Depends(get_current_user)
):
    if q:
        users = db.query(User).filter(User.username.ilike(f"%{q}%")).all()
    else:
        users = db.query(User).all()
    # Exclure l'utilisateur courant
    users = [u for u in users if u.username != current_username]
    return [{"id": u.id, "username": u.username, "avatar": getattr(u, "avatar", None)} for u in users]

# routes/messages.py

@router.get("/users/", response_model=list[dict])
async def get_all_users(
    db: Session = Depends(get_db),
    current_username: str = Depends(get_current_user)
):
    users = db.query(User).all()  # Récupérer tous les utilisateurs
    # Exclure l'utilisateur actuel
    users = [u for u in users if u.username != current_username]
    return [{"id": u.id, "username": u.username, "avatar": getattr(u, "avatar", None)} for u in users]
