from datetime import datetime

from pydantic import BaseModel


class ProjectCreate(BaseModel):
    name: str
    description: str
class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    status: str | None = None


class ProjectUpdate(BaseModel):
    name: str
    description: str
    status: str


class ProjectResponse(BaseModel):
    id: int
    name: str
    description: str
    status: str
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True