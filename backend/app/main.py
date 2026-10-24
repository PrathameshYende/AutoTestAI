from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.init_db import create_database
from app.api.v1.router import api_router
from app.api.v1.endpoints.analysis import router as analysis_router
from app.api.v1.endpoints.automation import router as automation_router


app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
)

# CORS configuration: allow the local AutoTestAI frontend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers.
app.include_router(
    api_router,
    prefix="/api/v1",
)
app.include_router(automation_router, prefix="/api/v1")

app.include_router(
    analysis_router,
    prefix="/api/v1",
)


# Uncomment this startup handler if you want the app
# to initialize the database automatically.
#
# @app.on_event("startup")
# def startup():
#     create_database()


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