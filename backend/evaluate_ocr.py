
import csv
from pathlib import Path

from PIL import Image
from app.services.ocr_service import extract_text_with_coordinates

VIDEO_ID = 3
FRAMES_DIR = Path("uploads/frames") / f"video_{VIDEO_ID}"
OUTPUT_FILE = Path("ocr_predictions_cropped.csv")

# Approximate webpage region based on the five screenshots.
# Excludes the browser tabs and address bar.
CROP_BOX = (180, 95, 1350, 950)


def main():
    if not FRAMES_DIR.exists():
        raise FileNotFoundError(
            f"Frames directory not found: {FRAMES_DIR.resolve()}"
        )

    frames = sorted(FRAMES_DIR.glob("*.jpg"))

    if not frames:
        raise FileNotFoundError(
            f"No JPG frames found in {FRAMES_DIR.resolve()}"
        )

    with OUTPUT_FILE.open(
        "w", newline="", encoding="utf-8-sig"
    ) as file:
        writer = csv.DictWriter(
            file,
            fieldnames=["frame", "ground_truth", "ocr_output"],
        )
        writer.writeheader()

        for frame in frames:
            with Image.open(frame) as image:
                width, height = image.size

                left, top, right, bottom = CROP_BOX
                crop_box = (
                    max(0, left),
                    max(0, top),
                    min(width, right),
                    min(height, bottom),
                )

                cropped = image.crop(crop_box)

                # Save a temporary cropped image for OCR.
                temp_path = Path("_ocr_temp_crop.png")
                cropped.save(temp_path)

            try:
                results = extract_text_with_coordinates(
                    str(temp_path)
                )
            finally:
                temp_path.unlink(missing_ok=True)

            recognized_text = " ".join(
                item["text"] for item in results
            )

            writer.writerow({
                "frame": frame.name,
                "ground_truth": "",
                "ocr_output": recognized_text,
            })

            print(f"\nFrame: {frame.name}")
            print(f"OCR text: {recognized_text or '[No text detected]'}")

    print(f"\nProcessed {len(frames)} frames.")
    print(f"CSV saved to: {OUTPUT_FILE.resolve()}")
    print("Ground truth is blank until manually verified.")


if __name__ == "__main__":
    main()
