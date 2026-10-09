import pytesseract
from PIL import Image
from pytesseract import Output

image_path = r"uploads/frames/video_3/frame_0001.jpg"

# Tesseract executable
pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)

image = Image.open(image_path)

print("Running OCR with coordinates...")
print("Image size:", image.size)

data = pytesseract.image_to_data(
    image,
    output_type=Output.DICT
)

print("\n========== OCR RESULTS ==========\n")

for i in range(len(data["text"])):
    text = data["text"][i].strip()

    if not text:
        continue

    confidence = float(data["conf"][i])

    # Ignore very low-confidence detections
    if confidence < 40:
        continue

    x = data["left"][i]
    y = data["top"][i]
    width = data["width"][i]
    height = data["height"][i]

    print(
        f"Text: {text}"
        f" | X: {x}"
        f" | Y: {y}"
        f" | Width: {width}"
        f" | Height: {height}"
        f" | Confidence: {confidence:.1f}"
    )