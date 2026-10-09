from app.database.base import Base
from app.database.session import engine

from app.models.user import User
from app.models.project import Project   # <-- Add this


def create_database():
    Base.metadata.create_all(bind=engine)