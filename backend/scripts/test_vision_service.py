from app.services.vision_service import analyze_frame
from app.services.ocr_service import extract_text_with_coordinates


image_path = "uploads/frames/video_3/frame_0001.jpg"

print("Running OCR...")
ocr_results = extract_text_with_coordinates(image_path)

ocr_text = [
    item["text"]
    for item in ocr_results
]

print("OCR detected:")
print(ocr_text)
print()

print("Sending frame + OCR to LLaVA...")
print()

result = analyze_frame(
    image_path,
    ocr_text=ocr_text
)

print("LLaVA Result:")
print(result)