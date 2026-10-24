
from app.services.analysis_pipeline import run_video_analysis

VIDEO_ID = 3

print(f"Starting AutoTestAI analysis for video {VIDEO_ID}...")
print("This may take several minutes because LLaVA runs locally.")
print()

result = run_video_analysis(
    video_id=VIDEO_ID,
    max_frames=3,
)

print("\n========== ANALYSIS SUMMARY ==========")
print(f"Video ID: {result['video_id']}")
print(f"Total frames: {result['total_frames']}")
print(f"Selected frames analyzed by AI: {result['selected_frames']}")
print(f"Inferred actions: {len(result['inferred_actions'])}")

print("\n========== INFERRED ACTIONS ==========")

for action in result["inferred_actions"]:
    print(action)

print("\nAnalysis completed.")
