from fastapi import HTTPException
from models.CommentModels import Comment
from Schemas.CommentSchema import CommentUpdate
from sqlalchemy.orm import Session

async def create_comment(db: Session, content: str, post_id: int, user_id: int):
    comment = Comment(content=content, post_id=post_id, user_id=user_id)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment

async def update_comment(db: Session, comment_id: int, update_data: CommentUpdate, current_user_id: int):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    if comment.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this comment")

    if update_data.content is not None:
        comment.content = update_data.content

    db.commit()
    db.refresh(comment)
    return comment


async def delete_comment(db: Session, comment_id: int, current_user_id: int):
    # Recherche le commentaire par son ID
    comment = db.query(Comment).filter(Comment.id == comment_id).first()

    # Si le commentaire n'existe pas
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    # Vérification que l'utilisateur actuel est bien celui qui a créé le commentaire
    if comment.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")

    # Suppression du commentaire
    db.delete(comment)
    db.commit()

    return {"detail": "Comment successfully deleted"}