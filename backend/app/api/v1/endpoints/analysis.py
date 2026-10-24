
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from pathlib import Path

from app.database.session import get_db
from app.models.video import Video
from app.models.project import Project
from app.models.user import User
from app.models.test_case import TestCase
from app.dependencies.auth import get_current_user

from app.services.ocr_service import extract_text_with_coordinates
from app.services.frame_analyzer import analyze_frames
from app.services.change_detector import (
    detect_frame_changes,
    select_important_frames,
)
from app.services.analysis_pipeline import run_video_analysis
from app.services.test_case_generator import generate_test_cases


router = APIRouter(prefix="/analysis", tags=["Analysis"])


class ManualTestCaseRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=1)
    steps: List[str] = Field(..., min_length=1)
    expected_result: str = Field(..., min_length=1)
    preconditions: List[str] = Field(default_factory=list)
    confidence: str = "medium"
    status: str = "draft"


def get_owned_video(
    video_id: int,
    current_user: User,
    db: Session,
):
    video = (
        db.query(Video)
        .join(Project, Video.project_id == Project.id)
        .filter(
            Video.id == video_id,
            Project.owner_id == current_user.id,
        )
        .first()
    )

    if video is None:
        raise HTTPException(status_code=404, detail="Video not found")

    return video


def serialize_test_case(case: TestCase) -> dict:
    return {
        "id": case.id,
        "test_case_id": case.test_case_id,
        "title": case.title,
        "source_frame": case.source_frame,
        "action_type": case.action_type,
        "description": case.description,
        "preconditions": case.preconditions,
        "steps": case.steps,
        "expected_result": case.expected_result,
        "confidence": case.confidence,
        "status": case.status,
        "created_at": case.created_at,
    }


@router.get("/ocr/{video_id}")
def analyze_video_ocr(
    video_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    video = get_owned_video(video_id, current_user, db)
    frames_dir = Path("uploads/frames") / f"video_{video.id}"

    if not frames_dir.exists():
        raise HTTPException(
            status_code=404,
            detail="Video frames not found. Process the video first.",
        )

    frame_files = sorted(frames_dir.glob("*.jpg"))

    if not frame_files:
        raise HTTPException(
            status_code=404,
            detail="No extracted frames found.",
        )

    first_frame = frame_files[0]
    ocr_results = extract_text_with_coordinates(str(first_frame))

    return {
        "video_id": video.id,
        "frame": first_frame.name,
        "ocr_results": ocr_results,
    }


@router.get("/frames/{video_id}")
def analyze_video_frames(
    video_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_owned_video(video_id, current_user, db)

    try:
        analyzed_frames = analyze_frames(video_id)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))

    return {
        "video_id": video_id,
        "frames_analyzed": len(analyzed_frames),
        "frames": analyzed_frames,
    }


@router.get("/changes/{video_id}")
def detect_video_changes(
    video_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_owned_video(video_id, current_user, db)

    try:
        analyzed_frames = analyze_frames(video_id)
        changes = detect_frame_changes(
            analyzed_frames,
            threshold=0.35,
        )
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))

    important_frames = select_important_frames(
        changes,
        max_frames=8,
    )

    return {
        "video_id": video_id,
        "total_frames": len(changes),
        "important_frames": len(important_frames),
        "selected_frames": important_frames,
        "changes": changes,
    }


@router.post("/test-cases/{video_id}")
def generate_video_test_cases(
    video_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    video = get_owned_video(video_id, current_user, db)

    try:
        analysis_result = run_video_analysis(
            video_id=video.id,
            max_frames=3,
        )

        generated_cases = generate_test_cases(
            analysis_result["inferred_actions"]
        )

        saved_cases = []

        for case in generated_cases:
            db_case = TestCase(
                test_case_id=case["test_case_id"],
                title=case["title"],
                source_frame=case.get("source_frame"),
                action_type=case["action_type"],
                description=case.get("description"),
                preconditions=case.get("preconditions", []),
                steps=case.get("steps", []),
                expected_result=case["expected_result"],
                confidence=case.get("confidence", "low"),
                status=case.get("status", "draft"),
                video_id=video.id,
            )
            db.add(db_case)
            saved_cases.append(db_case)

        db.commit()

        for case in saved_cases:
            db.refresh(case)

    except FileNotFoundError as exc:
        db.rollback()
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception:
        db.rollback()
        raise

    return {
        "video_id": video.id,
        "total_frames": analysis_result["total_frames"],
        "selected_frames": analysis_result["selected_frames"],
        "test_cases_generated": len(saved_cases),
        "test_cases": [
            serialize_test_case(case)
            for case in saved_cases
        ],
    }


@router.get("/test-cases/{video_id}")
def get_video_test_cases(
    video_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    video = get_owned_video(video_id, current_user, db)

    cases = (
        db.query(TestCase)
        .filter(TestCase.video_id == video.id)
        .order_by(TestCase.id.asc())
        .all()
    )

    return {
        "video_id": video.id,
        "test_cases_count": len(cases),
        "test_cases": [
            serialize_test_case(case)
            for case in cases
        ],
    }


@router.post("/test-cases/{video_id}/manual")
def create_manual_test_case(
    video_id: int,
    body: ManualTestCaseRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    video = get_owned_video(video_id, current_user, db)

    existing_count = (
        db.query(TestCase)
        .filter(TestCase.video_id == video.id)
        .count()
    )

    case = TestCase(
        test_case_id=f"TC-MANUAL-{existing_count + 1:03d}",
        title=body.title,
        source_frame=None,
        action_type="manual",
        description=body.description,
        preconditions=body.preconditions,
        steps=body.steps,
        expected_result=body.expected_result,
        confidence=body.confidence,
        status=body.status,
        video_id=video.id,
    )

    try:
        db.add(case)
        db.commit()
        db.refresh(case)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Could not save the manual test case.",
        )

    return {
        "message": "Manual test case created successfully",
        "test_case": serialize_test_case(case),
    }
