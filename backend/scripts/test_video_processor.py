from app.services.video_processor import extract_frames


video_path = "uploads/videos/WIN_20260827_21_24_45_Pro.mp4"
output_dir = "uploads/frames/video_1"


frames = extract_frames(
    video_path=video_path,
    output_dir=output_dir,
    interval_seconds=1.0
)


print("Frames extracted:", len(frames))

for frame in frames:
    print(frame)