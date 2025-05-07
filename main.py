from fastapi import FastAPI
from config import engine
from fastapi.middleware.cors import CORSMiddleware
import models.userModels as user 
import models.PostModels as Post
import models.MessageModels as Message
import models.CommentModels as Comment
import routes.userRoutes as user_route
import routes.PostRoutes as post_route
import routes.CommentRoutes as comment_route
import routes.MessageRoutes as message_route

# Créer l'application FastAPI une seule fois
app = FastAPI()

# Appliquer les configurations CORS sur l'application FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Autorise uniquement le frontend sur le port 5173
    allow_credentials=True,
    allow_methods=["*"],  # Autorise toutes les méthodes HTTP
    allow_headers=["*"],  # Autorise tous les headers
)

# Créer les tables dans la base de données
Comment.Base.metadata.create_all(bind=engine)
user.Base.metadata.create_all(bind=engine)
Message.Base.metadata.create_all(bind=engine)
Post.Base.metadata.create_all(bind=engine)

# Ajouter les routes aux applications
app.include_router(user_route.router)
app.include_router(post_route.router)
app.include_router(comment_route.router)
app.include_router(message_route.router)

# Ajouter la route OPTIONS pour /login
@app.options("/login")
async def options_login():
    return {
        "Access-Control-Allow-Origin": "http://localhost:5173",
        "Access-Control-Allow-Methods": "POST, OPTIONS",  # Autorise les méthodes nécessaires
        "Access-Control-Allow-Headers": "Content-Type, Authorization"  # Autorise les headers nécessaires
    }






