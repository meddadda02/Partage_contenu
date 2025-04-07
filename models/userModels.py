from sqlalchemy import Column, Integer, String, DateTime, func
from config import Base

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    photo = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    password_hash = Column(String)
    created_at = Column(DateTime, default=func.now())

