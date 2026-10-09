from pathlib import Path

from app.services.ocr_service import extract_text_with_coordinates
from app.services.vision_service import analyze_frame


def analyze_frame_with_ai(frame_path: str) -> dict:
    """
    Analyze one selected frame using OCR + LLaVA.
    """

    frame_path = Path(frame_path)

    if not frame_path.exists():
        raise FileNotFoundError(
            f"Frame not found: {frame_path}"
        )

    # -------------------------
    # OCR
    # -------------------------

    ocr_results = extract_text_with_coordinates(
        str(frame_path)
    )

    ocr_text = [
        item["text"]
        for item in ocr_results
    ]

    # -------------------------
    # Vision AI
    # -------------------------

    vision_result = analyze_frame(
        str(frame_path),
        ocr_text=ocr_text
    )

    # -------------------------
    # Combined result
    # -------------------------

    return {
        "frame": frame_path.name,
        "ocr": {
            "text": ocr_text,
            "details": ocr_results
        },
        "vision": vision_result
    }