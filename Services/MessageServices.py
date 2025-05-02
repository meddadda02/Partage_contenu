from sqlalchemy.orm import Session
from models.MessageModels import Message
from Schemas.MessgeSchema import MessageCreate

# Envoie un message et l'enregistre en base
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

# Récupère tous les messages où l'utilisateur est émetteur ou récepteur
def get_messages(db: Session, user_id: int):
    return db.query(Message).filter(
        (Message.sender_id == user_id) | (Message.receiver_id == user_id)
    ).order_by(Message.timestamp.desc()).all()

# Récupère les messages échangés entre deux utilisateurs
def get_conversation(db: Session, user_id: int, other_user_id: int):
    return db.query(Message).filter(
        ((Message.sender_id == user_id) & (Message.receiver_id == other_user_id)) |
        ((Message.sender_id == other_user_id) & (Message.receiver_id == user_id))
    ).order_by(Message.timestamp.asc()).all()
