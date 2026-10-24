
from app.services.frame_ai_analyzer import analyze_frame_with_ai

image_path = "uploads/frames/video_3/frame_0001.jpg"

print("Analyzing one frame using OCR + Vision AI...")
print("This may take a few minutes because LLaVA runs locally.")
print()

result = analyze_frame_with_ai(image_path)

print("Combined Analysis Result:")
print(result)
