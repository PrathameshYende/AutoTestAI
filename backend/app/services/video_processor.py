import cv2
from pathlib import Path


def extract_frames(
    video_path: str,
    output_dir: str,
    interval_seconds: float = 1.0
):
    video_path = Path(video_path)
    output_dir = Path(output_dir)

    output_dir.mkdir(
        parents=True,
        exist_ok=True
    )

    cap = cv2.VideoCapture(str(video_path))

    if not cap.isOpened():
        raise ValueError("Could not open video file")

    fps = cap.get(cv2.CAP_PROP_FPS)

    if fps <= 0:
        cap.release()
        raise ValueError("Could not determine video FPS")

    frame_interval = int(fps * interval_seconds)

    if frame_interval <= 0:
        frame_interval = 1

    frame_number = 0
    extracted_frames = []

    while True:
        success, frame = cap.read()

        if not success:
            break

        if frame_number % frame_interval == 0:

            frame_filename = (
                f"frame_{len(extracted_frames) + 1:04d}.jpg"
            )

            frame_path = output_dir / frame_filename

            cv2.imwrite(
                str(frame_path),
                frame
            )

            extracted_frames.append(
                str(frame_path)
            )

        frame_number += 1

    cap.release()

    return extracted_frames