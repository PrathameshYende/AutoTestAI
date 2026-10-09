from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pathlib import Path

from app.database.session import get_db
from app.models.video import Video
from app.models.project import Project
from app.models.user import User
from app.dependencies.auth import get_current_user
from app.services.ocr_service import extract_text_with_coordinates
from app.services.frame_analyzer import analyze_frames
from app.services.change_detector import (
    detect_frame_changes,
    select_important_frames
)


router = APIRouter(
    prefix="/analysis",
    tags=["Analysis"]
)


@router.get("/ocr/{video_id}")
def analyze_video_ocr(
    video_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    video = (
        db.query(Video)
        .join(Project, Video.project_id == Project.id)
        .filter(
            Video.id == video_id,
            Project.owner_id == current_user.id
        )
        .first()
    )

    if video is None:
        raise HTTPException(
            status_code=404,
            detail="Video not found"
        )

    frames_dir = Path("uploads/frames") / f"video_{video.id}"

    if not frames_dir.exists():
        raise HTTPException(
            status_code=404,
            detail="Video frames not found. Process the video first."
        )

    frame_files = sorted(
        frames_dir.glob("*.jpg")
    )

    if not frame_files:
        raise HTTPException(
            status_code=404,
            detail="No extracted frames found."
        )

    first_frame = frame_files[0]

    ocr_results = extract_text_with_coordinates(
        str(first_frame)
    )

    return {
        "video_id": video.id,
        "frame": first_frame.name,
        "ocr_results": ocr_results
    }


@router.get("/frames/{video_id}")
def analyze_video_frames(
    video_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    video = (
        db.query(Video)
        .join(Project, Video.project_id == Project.id)
        .filter(
            Video.id == video_id,
            Project.owner_id == current_user.id
        )
        .first()
    )

    if video is None:
        raise HTTPException(
            status_code=404,
            detail="Video not found"
        )

    try:
        analyzed_frames = analyze_frames(video_id)

    except FileNotFoundError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )

    return {
        "video_id": video_id,
        "frames_analyzed": len(analyzed_frames),
        "frames": analyzed_frames
    }


@router.get("/changes/{video_id}")
def detect_video_changes(
    video_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    video = (
        db.query(Video)
        .join(Project, Video.project_id == Project.id)
        .filter(
            Video.id == video_id,
            Project.owner_id == current_user.id
        )
        .first()
    )

    if video is None:
        raise HTTPException(
            status_code=404,
            detail="Video not found"
        )

    try:
        analyzed_frames = analyze_frames(video_id)

        changes = detect_frame_changes(
            analyzed_frames,
            threshold=0.35
        )

    except FileNotFoundError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )

    important_frames = select_important_frames(
        changes,
        max_frames=8
    )

    return {
        "video_id": video_id,
        "total_frames": len(changes),
        "important_frames": len(important_frames),
        "selected_frames": important_frames,
        "changes": changes
    }