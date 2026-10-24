
import csv
from pathlib import Path
from jiwer import cer, wer

GROUND_TRUTH_FILE = Path("ocr_ground_truth.csv")
OCR_FILE = Path("ocr_predictions_cropped.csv")


def read_csv_file(path):
    with path.open("r", encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file, skipinitialspace=True)

        if not reader.fieldnames:
            raise SystemExit(f"{path} is empty or has no header.")

        # Remove accidental spaces and BOM characters from column names.
        reader.fieldnames = [
            name.strip().lstrip("\ufeff") if name else ""
            for name in reader.fieldnames
        ]

        rows = list(reader)

        print(f"\nReading: {path}")
        print("Columns:", reader.fieldnames)

        return rows


for path in (GROUND_TRUTH_FILE, OCR_FILE):
    if not path.exists():
        raise SystemExit(f"File not found: {path.resolve()}")

ground_truth_rows = read_csv_file(GROUND_TRUTH_FILE)
ocr_rows = read_csv_file(OCR_FILE)

# Validate required columns.
if not ground_truth_rows or "frame" not in ground_truth_rows[0]:
    raise SystemExit(
        "Ground-truth CSV must have headers: frame,ground_truth. "
        "Check the first line of ocr_ground_truth.csv."
    )

if not ocr_rows or not {"frame", "ocr_output"}.issubset(ocr_rows[0]):
    raise SystemExit(
        "OCR CSV must have headers: frame,ocr_output. "
        "Check the first line of ocr_predictions_cropped.csv."
    )

ocr_by_frame = {
    row["frame"].strip(): (row.get("ocr_output") or "").strip()
    for row in ocr_rows
    if row.get("frame")
}

truths = []
predictions = []

for row in ground_truth_rows:
    frame = (row.get("frame") or "").strip()
    truth = (row.get("ground_truth") or "").strip()

    if not truth:
        print(f"Skipping {frame or '[unknown frame]'}: ground truth is empty")
        continue

    if frame not in ocr_by_frame:
        print(f"Skipping {frame}: OCR output not found")
        continue

    truths.append(truth)
    predictions.append(ocr_by_frame[frame])

if not truths:
    raise SystemExit(
        "No usable ground-truth text found. "
        "Check that the five CSV rows contain transcriptions."
    )

print(f"\nFrames evaluated: {len(truths)}")
print(f"Character Error Rate (CER): {cer(truths, predictions):.2%}")
print(f"Word Error Rate (WER): {wer(truths, predictions):.2%}")
