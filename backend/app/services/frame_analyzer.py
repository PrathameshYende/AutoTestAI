from pathlib import Path

from app.services.ocr_service import extract_text_with_coordinates


def analyze_frames(video_id: int):
    """
    Analyze all extracted frames for a video using OCR.
    """

    frames_dir = Path("uploads/frames") / f"video_{video_id}"

    if not frames_dir.exists():
        raise FileNotFoundError(
            f"Frames directory not found: {frames_dir}"
        )

    frame_files = sorted(frames_dir.glob("*.jpg"))

    if not frame_files:
        raise FileNotFoundError(
            f"No frames found for video {video_id}"
        )

    analyzed_frames = []

    for frame_file in frame_files:

        ocr_results = extract_text_with_coordinates(
            str(frame_file)
        )

        # Create a simple list of visible text
        visible_text = [
            item["text"]
            for item in ocr_results
        ]

        analyzed_frames.append({
            "frame": frame_file.name,
            "ocr_results": ocr_results,
            "visible_text": visible_text
        })

    return analyzed_frames