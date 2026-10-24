
from app.services.analysis_pipeline import run_video_analysis

VIDEO_ID = 2

print("Starting AutoTestAI latency measurement...")
result = run_video_analysis(video_id=VIDEO_ID, max_frames=3)

print("\nRESULTS FOR RESEARCH PAPER")
print("Video ID:", VIDEO_ID)
print("Total frames:", result["total_frames"])
print("Selected frames:", result["selected_frames"])

for stage, seconds in result["latency"].items():
    print(f"{stage}: {seconds:.4f} seconds")
