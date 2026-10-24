
import base64
import json
import requests
from pathlib import Path

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llava:7b"


def vision_fallback(reason: str) -> dict:
    return {
        "application": "unknown",
        "screen": "unknown",
        "buttons": [],
        "input_fields": [],
        "ui_state": "Vision analysis unavailable",
        "possible_action": "unknown",
        "analysis_warning": reason
    }


def encode_image(image_path: str) -> str:
    """Convert an image file to Base64."""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(
            image_file.read()
        ).decode("utf-8")


def analyze_frame(
    image_path: str,
    ocr_text: list[str] | None = None
) -> dict:
    """Analyze a UI screenshot using Ollama + LLaVA."""

    image_path = Path(image_path)

    if not image_path.exists():
        raise FileNotFoundError(
            f"Image not found: {image_path}"
        )

    image_base64 = encode_image(str(image_path))
    ocr_context = "\n".join(ocr_text) if ocr_text else ""

    prompt = f"""
You are analyzing a screenshot from a software testing
screen recording.

Treat the OCR text as the primary source for visible text.
Do not invent applications, buttons, or input fields.
If something is uncertain, say "unknown".

OCR TEXT FROM THIS FRAME:
{ocr_context}

Determine:
1. Application or website, if identifiable.
2. Screen or page type.
3. Important visible controls.
4. Visible input fields.
5. Current UI state.
6. Most likely user action associated with this state.

Return ONLY valid JSON:
{{
    "application": "",
    "screen": "",
    "buttons": [],
    "input_fields": [],
    "ui_state": "",
    "possible_action": ""
}}
"""

    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "images": [image_base64],
        "stream": False
    }

    try:
        response = requests.post(
            OLLAMA_URL,
            json=payload,
            timeout=(10, 120)
        )
        response.raise_for_status()
        result = response.json()

    except requests.exceptions.Timeout:
        return vision_fallback(
            "LLaVA timed out while analyzing this frame."
        )

    except requests.exceptions.RequestException as exc:
        return vision_fallback(
            f"Ollama request failed: {type(exc).__name__}"
        )

    except ValueError:
        return vision_fallback(
            "Ollama returned an invalid response."
        )

    raw_response = result.get("response", "").strip()

    try:
        parsed = json.loads(raw_response)
        return parsed if isinstance(parsed, dict) else vision_fallback(
            "LLaVA returned JSON in an unexpected format."
        )
    except json.JSONDecodeError:
        pass

    cleaned_response = raw_response

    if cleaned_response.startswith("```json"):
        cleaned_response = cleaned_response[len("```json"):].strip()
    elif cleaned_response.startswith("```"):
        cleaned_response = cleaned_response[len("```"):].strip()

    if cleaned_response.endswith("```"):
        cleaned_response = cleaned_response[:-3].strip()

    try:
        parsed = json.loads(cleaned_response)
        return parsed if isinstance(parsed, dict) else vision_fallback(
            "LLaVA returned JSON in an unexpected format."
        )
    except json.JSONDecodeError:
        return {
            **vision_fallback("LLaVA returned invalid JSON."),
            "raw_response": raw_response
        }
