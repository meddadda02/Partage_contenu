from fastapi import FastAPI
from config import engine
import models.userModels as user 
import routes.userRoutes as user_route


user.Base.metadata.create_all(bind=engine)
app=FastAPI()
app.include_router(user_route.router)

