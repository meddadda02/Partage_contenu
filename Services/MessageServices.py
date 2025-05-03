from fastapi import HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from models.MessageModels import Message
from Schemas.MessageSchema import MessageCreate

def send_message(db: Session, sender_id: int, message: MessageCreate):
    db_message = Message(
        sender_id=sender_id,
        receiver_id=message.receiver_id,
        content=message.content
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

def get_conversation(db: Session, user_id: int, other_user_id: int):
    return db.query(Message).filter(
        (
            ((Message.sender_id == user_id) & (Message.receiver_id == other_user_id) & (~Message.is_deleted_by_sender)) |
            ((Message.sender_id == other_user_id) & (Message.receiver_id == user_id) & (~Message.is_deleted_by_receiver))
        )
    ).order_by(Message.timestamp.asc()).all()

    
def update_message(db: Session, message_id: int, user_id: int, new_content: str):
    message = db.query(Message).filter(Message.id == message_id).first()

    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    if message.sender_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this message")

    message.content = new_content
    db.commit()
    db.refresh(message)
    return message

def delete_conversation(db: Session, user_id: int, other_user_id: int):
    messages = db.query(Message).filter(
        ((Message.sender_id == user_id) & (Message.receiver_id == other_user_id)) |
        ((Message.sender_id == other_user_id) & (Message.receiver_id == user_id))
    ).all()

    for msg in messages:
        if msg.sender_id == user_id and not msg.is_deleted_by_sender:
            msg.is_deleted_by_sender = True
            msg.deleted_at = datetime.utcnow()  # Ajout de la date de suppression
        elif msg.receiver_id == user_id and not msg.is_deleted_by_receiver:
            msg.is_deleted_by_receiver = True
            msg.deleted_at = datetime.utcnow()  # Ajout de la date de suppression

    db.commit()
    return {"detail": "Conversation supprimée avec succès."}

def delete_single_message(db: Session, user_id: int, message_id: int):
    message = db.query(Message).filter(Message.id == message_id).first()
    
    if not message:
        return {"detail": "Message non trouvé."}
    
    # Vérifie si l'utilisateur est l'expéditeur ou le destinataire
    if message.sender_id == user_id:
        message.is_deleted_by_sender = True
        message.deleted_at = datetime.utcnow()
    elif message.receiver_id == user_id:
        message.is_deleted_by_receiver = True
        message.deleted_at = datetime.utcnow()
    else:
        return {"detail": "Vous ne pouvez pas supprimer ce message."}

    db.commit()
    return {"detail": f"Message {message_id} supprimé avec succès."}

def check_and_delete_message(db: Session, message_id: int):
    message = db.query(Message).filter_by(id=message_id).first()
    
    if message and message.is_deleted_by_sender and message.is_deleted_by_receiver:
        db.delete(message)
        db.commit()
        return {"detail": f"Message {message_id} supprimé définitivement."}
    else:
        return {"detail": f"Message {message_id} n'a pas été supprimé par les deux parties."}
