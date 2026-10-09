import base64
import requests
from PIL import Image
from io import BytesIO

image_path = r"uploads/frames/video_3/frame_0001.jpg"

# Resize image to reduce CPU/RAM usage
image = Image.open(image_path)
image.thumbnail((960, 600))

buffer = BytesIO()
image.save(buffer, format="JPEG", quality=70)

image_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

print("Sending frame to Ollama...")
print("Image size:", image.size)

response = requests.post(
    "http://localhost:11434/api/generate",
    json={
        "model": "llava:7b",
        "prompt": """
You are analyzing ONE screenshot from a web browser screen recording.

IMPORTANT:
- Describe ONLY things that are clearly visible.
- Do NOT guess the website or application.
- Do NOT invent buttons, menus, text, or actions.
- If text is unclear, say "text unclear".
- If you cannot identify something, say "not identifiable".

Analyze the screenshot and return:

1. Visible website/page:
2. Clearly visible text:
3. Buttons or clickable elements:
4. Input fields:
5. What the user appears to be doing:
6. Any visible error or warning:
7. Overall description:

Keep the answer factual and concise.
""",
        "images": [image_base64],
        "stream": False,
        "options": {
            "temperature": 0.1
        }
    },
    timeout=180
)

if response.status_code != 200:
    print("\nOllama error:")
    print(response.text)
else:
    result = response.json()
    
    print("\n========== LLaVA RESULT ==========\n")
    print(result["response"])