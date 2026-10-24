from fastapi import APIRouter
from app.api.v1.endpoints import auth, projects, videos, dashboard

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(projects.router)
api_router.include_router(videos.router)
api_router.include_router(dashboard.router)