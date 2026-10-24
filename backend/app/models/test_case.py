from sqlalchemy import (
    Column, Integer, String, Text,
    ForeignKey, DateTime, JSON
)
from sqlalchemy.sql import func

from app.database.base import Base


class TestCase(Base):
    __tablename__ = "test_cases"

    id = Column(Integer, primary_key=True, index=True)
    test_case_id = Column(String(20), nullable=False)
    title = Column(String(255), nullable=False)
    source_frame = Column(String(255), nullable=True)
    action_type = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)

    preconditions = Column(JSON, nullable=False, default=list)
    steps = Column(JSON, nullable=False, default=list)
    expected_result = Column(Text, nullable=False)

    confidence = Column(String(20), nullable=False, default="low")
    status = Column(String(30), nullable=False, default="draft")

    video_id = Column(
        Integer,
        ForeignKey("videos.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    created_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False
    )