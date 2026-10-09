from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    name: Mapped[str] = mapped_column(
        String(100)
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True
    )

    password: Mapped[str] = mapped_column(
        String(255)
    )

    # One User → Many Projects
    projects = relationship(
        "Project",
        back_populates="owner",
        cascade="all, delete-orphan"
    )