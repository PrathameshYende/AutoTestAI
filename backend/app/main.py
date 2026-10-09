from fastapi import FastAPI

from app.core.config import settings
from app.database.init_db import create_database
from app.api.v1.router import api_router
from app.api.v1.endpoints.analysis import router as analysis_router

app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
)
app.include_router(
    api_router,
    prefix="/api/v1"
)
app.include_router(
    analysis_router,
    prefix="/api/v1"
)


#@app.on_event("startup")
#def startup():

 #   create_database()


@app.get("/")
def root():

    return {
        "message": "Welcome to AutoTestAI 🚀"
    }


@app.get("/health")
def health():

    return {
        "status": "healthy"
    }