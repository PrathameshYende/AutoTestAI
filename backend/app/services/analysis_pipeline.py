
from pathlib import Path
from time import perf_counter

from app.services.frame_analyzer import analyze_frames
from app.services.change_detector import (
    detect_frame_changes,
    select_important_frames,
)
from app.services.frame_ai_analyzer import analyze_frame_with_ai
from app.services.action_inference import infer_actions


def run_video_analysis(
    video_id: int,
    max_frames: int = 3,
) -> dict:
    """Analyze video frames and record the duration of each stage."""

    total_start = perf_counter()
    timings = {}

    # Step 1: Analyze frames and extract OCR data
    start = perf_counter()
    frames = analyze_frames(video_id)
    timings["frame_analysis_seconds"] = round(
        perf_counter() - start, 4
    )

    # Step 2: Detect changes between frames
    start = perf_counter()
    changes = detect_frame_changes(frames, threshold=0.35)
    timings["change_detection_seconds"] = round(
        perf_counter() - start, 4
    )

    # Step 3: Select important frames
    start = perf_counter()
    selected_frames = select_important_frames(
        changes,
        max_frames=max_frames,
    )
    timings["frame_selection_seconds"] = round(
        perf_counter() - start, 4
    )

    # Step 4: Analyze selected frames using vision AI
    start = perf_counter()
    frames_dir = Path("uploads/frames") / f"video_{video_id}"
    ai_results = []

    for selected in selected_frames:
        frame_name = selected["frame"]
        frame_path = frames_dir / frame_name

        print(f"Analyzing {frame_name}...")
        result = analyze_frame_with_ai(str(frame_path))
        ai_results.append(result)

    timings["vision_ai_seconds"] = round(
        perf_counter() - start, 4
    )

    # Step 5: Infer possible user actions
    start = perf_counter()
    actions = infer_actions(ai_results)
    timings["action_inference_seconds"] = round(
        perf_counter() - start, 4
    )

    timings["total_seconds"] = round(
        perf_counter() - total_start, 4
    )

    print("\n--- AutoTestAI Latency Results ---")
    for stage, seconds in timings.items():
        print(f"{stage}: {seconds:.4f} seconds")
    print("----------------------------------\n")

    return {
        "video_id": video_id,
        "total_frames": len(frames),
        "selected_frames": len(selected_frames),
        "ai_results": ai_results,
        "inferred_actions": actions,
        "latency": timings,
    }
