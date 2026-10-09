from app.services.video_processor import extract_frames
from fastapi.responses import FileResponse
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from pathlib import Path
import shutil

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.project import Project
from app.models.video import Video


router = APIRouter(
    prefix="/videos",
    tags=["Videos"]
)


UPLOAD_DIR = Path("uploads/videos")
UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)


@router.post("/{project_id}")
def upload_video(
    project_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # Check project ownership
    project = (
        db.query(Project)
        .filter(
            Project.id == project_id,
            Project.owner_id == current_user.id
        )
        .first()
    )

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    # Check file type
    allowed_types = [
        "video/mp4",
        "video/webm",
        "video/quicktime"
    ]

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only MP4, WebM and MOV videos are allowed"
        )

    # Create a unique filename
    filename = file.filename or "uploaded_video"

    file_path = UPLOAD_DIR / filename

    # Save video to disk
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    # Save metadata in database
    video = Video(
        filename=filename,
        file_path=str(file_path),
        content_type=file.content_type,
        project_id=project_id
    )

    db.add(video)
    db.commit()
    db.refresh(video)

    return {
        "message": "Video uploaded successfully",
        "video_id": video.id,
        "filename": video.filename,
        "project_id": video.project_id
    }
@router.get("/project/{project_id}")
def get_project_videos(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check that the project belongs to the logged-in user
    project = (
        db.query(Project)
        .filter(
            Project.id == project_id,
            Project.owner_id == current_user.id
        )
        .first()
    )

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    videos = (
        db.query(Video)
        .filter(Video.project_id == project_id)
        .all()
    )

    return videos
@router.get("/{video_id}/stream")
def stream_video(
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

    file_path = Path(video.file_path)

    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Video file not found"
        )

    return FileResponse(
        path=file_path,
        media_type=video.content_type,
        filename=video.filename
    )
# ---------------- PROCESS VIDEO ---------------- #

@router.post("/{video_id}/process")
def process_video(
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

    video_path = Path(video.file_path)

    if not video_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Video file not found"
        )

    output_dir = (
        Path("uploads/frames")
        / f"video_{video.id}"
    )

    try:
        frames = extract_frames(
            video_path=str(video_path),
            output_dir=str(output_dir),
            interval_seconds=1.0
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    return {
        "message": "Video processed successfully",
        "video_id": video.id,
        "project_id": video.project_id,
        "frames_extracted": len(frames),
        "frames_directory": str(output_dir)
    }