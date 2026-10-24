from typing import Any
import re


def normalize_text(text: Any) -> str:
    """Normalize OCR text to reduce differences caused by formatting."""
    if not isinstance(text, str):
        return ""

    text = text.lower()
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^\w\s]", "", text)

    return text.strip()


def get_ocr_text(frame: dict[str, Any]) -> set[str]:
    """Extract normalized, meaningful OCR text from a frame."""
    ocr = frame.get("ocr", {})
    texts = ocr.get("text", []) if isinstance(ocr, dict) else []

    if not isinstance(texts, list):
        return set()

    return {
        normalize_text(text)
        for text in texts
        if isinstance(text, str) and normalize_text(text)
    }


def get_screen_name(frame: dict[str, Any]) -> str:
    """Get a usable screen description from the vision result."""
    vision = frame.get("vision", {})

    if not isinstance(vision, dict):
        return ""

    screen = vision.get("screen", "")

    if not isinstance(screen, str):
        return ""

    screen = screen.strip()

    # Ignore empty and generic descriptions.
    if normalize_text(screen) in {
        "",
        "unknown",
        "none",
        "null",
        "not sure",
        "unidentified screen",
    }:
        return ""

    # Avoid treating OCR echoes as reliable screen identification.
    if normalize_text(screen).startswith("ocr text from this frame"):
        return ""

    return screen


def infer_actions(
    analyzed_frames: list[dict[str, Any]]
) -> list[dict[str, Any]]:
    """
    Infer likely UI changes from sequential frame analyses.

    OCR text is the primary evidence for visible changes.
    Vision descriptions are supporting evidence only.

    A detected change does not prove which user action caused it.
    """

    inferred_actions = []

    for index, current in enumerate(analyzed_frames):
        current_ocr = get_ocr_text(current)
        current_vision = current.get("vision", {})

        if not isinstance(current_vision, dict):
            current_vision = {}

        current_screen = get_screen_name(current)

        if index == 0:
            inferred_actions.append({
                "frame": current.get("frame", ""),
                "action": "initial_screen",
                "description": (
                    "Initial screen captured in the recording. "
                    "Verify the visible elements against the screenshot."
                ),
                "visible_text": sorted(current_ocr),
                "screen": current_screen,
                "possible_action": current_vision.get(
                    "possible_action", ""
                ),
                "confidence": "medium",
            })
            continue

        previous = analyzed_frames[index - 1]
        previous_ocr = get_ocr_text(previous)
        previous_screen = get_screen_name(previous)

        # Find text changes after normalization.
        added_text = sorted(current_ocr - previous_ocr)
        removed_text = sorted(previous_ocr - current_ocr)

        # Measure the size of the text change relative to both frames.
        all_text = current_ocr | previous_ocr

        if all_text:
            change_ratio = (
                len(current_ocr ^ previous_ocr) / len(all_text)
            )
        else:
            change_ratio = 0.0

        # Only use clearly different screen descriptions as supporting
        # evidence. A description difference alone cannot prove navigation.
        screen_changed = (
            bool(previous_screen)
            and bool(current_screen)
            and normalize_text(previous_screen)
            != normalize_text(current_screen)
        )

        if change_ratio >= 0.35:
            action = "ui_change"
            description = (
                "A substantial change in visible OCR text was detected. "
                "Inspect the current and previous screenshots to determine "
                "whether this represents navigation or another UI change."
            )
            confidence = "medium"

        elif added_text or removed_text:
            action = "minor_text_change"
            description = (
                "A small change in visible text was detected. "
                "It may be caused by a UI update or OCR variation."
            )
            confidence = "low"

        else:
            action = "no_significant_text_change"
            description = (
                "No meaningful difference was detected in OCR text. "
                "Visual changes without text changes may still be present."
            )
            confidence = "low"

        if screen_changed:
            description += (
                " Vision AI also reported a different screen description; "
                "confirm the transition using the screenshots."
            )

        inferred_actions.append({
            "frame": current.get("frame", ""),
            "action": action,
            "description": description,
            "added_text": added_text,
            "removed_text": removed_text,
            "change_ratio": round(change_ratio, 3),
            "screen": current_screen,
            "possible_action": current_vision.get(
                "possible_action", ""
            ),
            "confidence": confidence,
        })

    return inferred_actions