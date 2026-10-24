"""AI-assisted automation script generation for saved AutoTestAI test cases.

This endpoint generates code only. It deliberately does not execute generated code.
"""
import re
from app.services.local_code_generator import generate_playwright_code
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.project import Project
from app.models.test_case import TestCase
from app.models.user import User
from app.models.video import Video

router = APIRouter(prefix="/automation", tags=["Automation"])


class GenerateAutomationRequest(BaseModel):
    test_case_id: str = Field(..., min_length=1, max_length=50, description="Database ID or public test_case_id such as TC-001")
    target_url: Optional[str] = Field(default=None, max_length=2048)
    source: Literal["recording", "url", "both"] = "both"
    framework: Literal["playwright", "selenium"] = "playwright"


def _safe_target_url(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    value = value.strip()
    if not re.match(r"^https?://", value, flags=re.IGNORECASE):
        raise HTTPException(status_code=422, detail="Target URL must start with http:// or https://")
    return value


def _frame_data_url(video_id: int, source_frame: Optional[str]) -> Optional[str]:
    """Attach a saved source frame as optional visual context when it exists."""
    if not source_frame or Path(source_frame).name != source_frame:
        return None
    frame_path = Path("uploads/frames") / f"video_{video_id}" / source_frame
    if not frame_path.is_file():
        return None
    try:
        encoded = base64.b64encode(frame_path.read_bytes()).decode("ascii")
        return f"data:image/jpeg;base64,{encoded}"
    except OSError:
        return None


def _call_openai(prompt: str, image_url: Optional[str], model: str) -> str:
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="OPENAI_API_KEY is not configured in the backend environment. Add it to backend .env and restart FastAPI.",
        )

    content = [{"type": "text", "text": prompt}]
    if image_url:
        content.append({"type": "image_url", "image_url": {"url": image_url, "detail": "high"}})
    payload = {
        "model": model,
        "temperature": 0.1,
        "messages": [
            {"role": "system", "content": (
                "You generate careful, maintainable browser-automation test scripts. "
                "Return only executable Python source code, without Markdown fences. "
                "Never invent selectors or actions as if they were observed. If details are unknown, "
                "write TODO comments and use robust accessible locators where justified. "
                "Do not include credentials, destructive actions, shell commands, or code that exfiltrates data."
            )},
            {"role": "user", "content": content},
        ],
    }
    request = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=110) as response:
            result = json.loads(response.read().decode("utf-8"))
        text = result["choices"][0]["message"]["content"].strip()
    except urllib.error.HTTPError as exc:
        details = exc.read().decode("utf-8", errors="replace")[:1000]
        if exc.code in (401, 403):
            raise HTTPException(status_code=502, detail="OpenAI API authentication failed. Check OPENAI_API_KEY.")
        if exc.code == 429:
            raise HTTPException(status_code=429, detail="OpenAI API rate limit or quota reached. Check API billing and limits.")
        raise HTTPException(status_code=502, detail=f"OpenAI API returned HTTP {exc.code}: {details}")
    except (urllib.error.URLError, TimeoutError) as exc:
        raise HTTPException(status_code=504, detail=f"OpenAI request timed out or could not connect: {exc}")
    except (KeyError, IndexError, json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise HTTPException(status_code=502, detail=f"Could not parse the OpenAI response: {exc}")

    # Tolerate code fences even if the model unexpectedly returns them.
    text = re.sub(r"^```(?:python)?\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s*```$", "", text)
    if not text or "def test_" not in text:
        raise HTTPException(status_code=502, detail="The model did not return a recognizable Python test function. Try generating again.")
    return text + "\n"


@router.post("/generate/{video_id}")
def generate_automation_code(
    video_id: int,
    body: GenerateAutomationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    video = (
        db.query(Video)
        .join(Project, Video.project_id == Project.id)
        .filter(Video.id == video_id, Project.owner_id == current_user.id)
        .first()
    )
    if video is None:
        raise HTTPException(status_code=404, detail="Video not found")

    query = db.query(TestCase).filter(TestCase.video_id == video.id)
    if body.test_case_id.isdigit():
        query = query.filter(TestCase.id == int(body.test_case_id))
    else:
        query = query.filter(TestCase.test_case_id == body.test_case_id)
    case = query.first()
    if case is None:
        raise HTTPException(status_code=404, detail="Test case not found for this video")

    target_url = _safe_target_url(body.target_url)
    if body.source == "url" and not target_url:
        raise HTTPException(status_code=422, detail="Enter a target website URL when using URL context")
    target_url = _safe_target_url(body.target_url)

    if body.source == "url" and not target_url:
        raise HTTPException(
            status_code=422,
            detail="Enter a target website URL when using URL context",
        )

    # Convert the database test case into a dictionary
    test_case_data = {
        "id": case.id,
        "test_case_id": case.test_case_id,
        "title": case.title,
        "source_frame": case.source_frame,
        "action_type": case.action_type,
        "description": case.description,
        "preconditions": case.preconditions or [],
        "steps": case.steps or [],
        "expected_result": case.expected_result,
        "confidence": case.confidence,
        "status": case.status,
    }

    # Generate a draft locally; no OpenAI API key is required
    result = generate_playwright_code(
        test_case=test_case_data,
        target_url=target_url,
    )

    # Keep the existing response information for the frontend
    result.update({
        "video_id": video.id,
        "test_case_id": case.test_case_id,
        "test_case_db_id": case.id,
        "title": case.title,
        "framework": body.framework,
        "target_url": target_url,
        "source": body.source,
        "executed": False,
    })

    if body.framework == "selenium":
        result.setdefault("warnings", []).append(
            "The local generator currently creates Playwright code. "
            "Selenium generation is not implemented in this local generator."
        )

    return result
