import re


# OCR tokens that are usually noise and should not affect change detection
NOISE_TOKENS = {
    "|",
    "©",
    "®",
    "™",
    "_",
    "-",
    "=",
    ">",
    "<",
    "@",
    "#",
    "&",
    "o;",
    "g_",
    "p",
    "q",
    "x",
    "y",
    "v",
    "a",
}


def normalize_text(text: str) -> str:
    text = text.lower().strip()

    # Remove unusual OCR characters
    text = re.sub(r"[^\w\s:/.-]", "", text)

    # Normalize spaces
    text = " ".join(text.split())

    return text


def is_meaningful_text(text: str) -> bool:
    text = normalize_text(text)

    if not text:
        return False

    # Ignore known OCR noise
    if text in NOISE_TOKENS:
        return False

    # Ignore very short single-character OCR results
    if len(text) <= 1:
        return False

    return True


def get_meaningful_text(text_list: list[str]) -> set[str]:
    meaningful = set()

    for text in text_list:
        normalized = normalize_text(text)

        if is_meaningful_text(normalized):
            meaningful.add(normalized)

    return meaningful


def text_change_score(
    previous_text: list[str],
    current_text: list[str]
) -> float:

    previous = get_meaningful_text(previous_text)
    current = get_meaningful_text(current_text)

    if not previous and not current:
        return 0.0

    union = previous | current

    if not union:
        return 0.0

    difference = previous.symmetric_difference(current)

    return len(difference) / len(union)


def detect_frame_changes(
    analyzed_frames: list[dict],
    threshold: float = 0.35
):
    changes = []

    for index, frame in enumerate(analyzed_frames):

        current_text = get_meaningful_text(
            frame["visible_text"]
        )

        # First frame is always important
        if index == 0:
            changes.append({
                "frame": frame["frame"],
                "change_score": 1.0,
                "changed": True,
                "added_text": sorted(current_text),
                "removed_text": []
            })
            continue

        previous_frame = analyzed_frames[index - 1]

        previous_text = get_meaningful_text(
            previous_frame["visible_text"]
        )

        score = text_change_score(
            list(previous_text),
            list(current_text)
        )

        added_text = sorted(
            current_text - previous_text
        )

        removed_text = sorted(
            previous_text - current_text
        )

        changes.append({
            "frame": frame["frame"],
            "change_score": round(score, 3),
            "changed": score >= threshold,
            "added_text": added_text,
            "removed_text": removed_text
        })

    return changes
def select_important_frames(
    changes: list[dict],
    max_frames: int = 8
):
    """
    Select the strongest frames for AI analysis.

    Keeps the first frame and then selects frames
    with the highest change scores.
    """

    if not changes:
        return []

    # First frame provides the initial UI state
    selected = [changes[0]]

    remaining = changes[1:]

    # Sort by strongest visual/text change
    remaining = sorted(
        remaining,
        key=lambda item: item["change_score"],
        reverse=True
    )

    for change in remaining:
        if not change["changed"]:
            continue

        if len(selected) >= max_frames:
            break

        selected.append(change)

    # Return frames in their original video order
    selected.sort(
        key=lambda item: item["frame"]
    )

    return selected
