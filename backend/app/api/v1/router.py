from fastapi import APIRouter

from app.api.v1.endpoints import auth, projects, videos



api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(projects.router)
api_router.include_router(videos.router)
