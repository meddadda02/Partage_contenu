from fastapi import FastAPI
from config import engine
import models.userModels as user 
import models.PostModels as Post
import models.CommentModels as Comment
import routes.userRoutes as user_route
import routes.PostRoutes as post_route
import routes.CommentRoutes as comment_route


Comment.Base.metadata.create_all(bind=engine)
user.Base.metadata.create_all(bind=engine)
Post.Base.metadata.create_all(bind=engine)

app=FastAPI()
app.include_router(user_route.router)
app.include_router(post_route.router)
app.include_router(comment_route.router)



