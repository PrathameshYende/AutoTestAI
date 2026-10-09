import pytesseract
from PIL import Image
from pytesseract import Output


# Tesseract executable
pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)


def extract_text_with_coordinates(image_path: str):
    """
    Extract visible text from an image along with
    its screen coordinates and OCR confidence.
    """

    image = Image.open(image_path)

    data = pytesseract.image_to_data(
        image,
        output_type=Output.DICT
    )

    results = []

    for i in range(len(data["text"])):

        text = data["text"][i].strip()

        if not text:
            continue

        try:
            confidence = float(data["conf"][i])
        except (ValueError, TypeError):
            continue

        # Ignore low-confidence detections
        if confidence < 40:
            continue

        x = data["left"][i]
        y = data["top"][i]
        width = data["width"][i]
        height = data["height"][i]

        results.append({
            "text": text,
            "x": x,
            "y": y,
            "width": width,
            "height": height,
            "confidence": round(confidence, 2)
        })

    return results