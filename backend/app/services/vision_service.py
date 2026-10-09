import base64
import json
import requests
from pathlib import Path


OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llava:7b"


def encode_image(image_path: str) -> str:
    """
    Convert an image file to Base64.
    """

    with open(image_path, "rb") as image_file:
        return base64.b64encode(
            image_file.read()
        ).decode("utf-8")


def analyze_frame(
    image_path: str,
    ocr_text: list[str] | None = None
) -> dict:
    """
    Analyze a UI screenshot using Ollama + LLaVA.
    """

    image_path = Path(image_path)

    if not image_path.exists():
        raise FileNotFoundError(
            f"Image not found: {image_path}"
        )

    image_base64 = encode_image(
        str(image_path)
    )

    ocr_context = ""

    if ocr_text:
        ocr_context = "\n".join(ocr_text)

    prompt = f"""
You are analyzing a screenshot from a software testing
screen recording.

IMPORTANT RULES:

- The OCR text below was extracted directly from the screenshot.
- Treat the OCR text as the primary source for visible text.
- Do NOT invent another application or website.
- Do NOT claim that Slack, Discord, WhatsApp, or another
  application is visible unless supported by the screenshot
  AND OCR text.
- Do not invent buttons or input fields.
- If something is uncertain, say "unknown".

OCR TEXT FROM THIS FRAME:

{ocr_context}

Using both the screenshot and OCR text, determine:

1. The application or website if identifiable.
2. The type of screen/page.
3. Important controls visible.
4. Input fields visible.
5. Current UI state.
6. The most likely user action associated with this state.

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

    response = requests.post(
        OLLAMA_URL,
        json=payload,
        timeout=180
    )

    response.raise_for_status()

    result = response.json()

    raw_response = result.get(
        "response",
        ""
    ).strip()

    # Try to parse normal JSON
    try:
        return json.loads(raw_response)

    except json.JSONDecodeError:
        pass

    # Remove Markdown JSON code fences
    cleaned_response = raw_response

    if cleaned_response.startswith("```json"):
        cleaned_response = cleaned_response[len("```json"):]

    elif cleaned_response.startswith("```"):
        cleaned_response = cleaned_response[len("```"):]

    if cleaned_response.endswith("```"):
        cleaned_response = cleaned_response[:-3]

    cleaned_response = cleaned_response.strip()

    # Try parsing cleaned JSON
    try:
        return json.loads(cleaned_response)

    except json.JSONDecodeError:
        return {
            "raw_response": raw_response
        }