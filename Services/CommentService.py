from models.CommentModels import Comment
from sqlalchemy.orm import Session

async def create_comment(db: Session, content: str, post_id: int, user_id: int):
    comment = Comment(content=content, post_id=post_id, user_id=user_id)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment
