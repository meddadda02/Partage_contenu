from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
secret_key = os.getenv("SECRET_KEY")
algorithm=os.getenv("ALGORITHM")
engine=create_engine(DATABASE_URL)
SessionLocal=sessionmaker(autocommit=False,autoflush=False,bind=engine)
Base=declarative_base()



def get_db():
    db=SessionLocal()
    try:
        yield db
    finally: db.close()
