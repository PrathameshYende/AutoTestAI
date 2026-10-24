from pprint import pprint

from app.services.test_case_generator import generate_test_cases


sample_actions = [
    {
        "frame": "frame_0001.jpg",
        "action": "initial_screen",
        "description": "Initial screen captured.",
        "visible_text": ["login", "register"],
        "confidence": "medium",
    },
    {
        "frame": "frame_0006.jpg",
        "action": "ui_change",
        "description": "A substantial change in visible OCR text was detected.",
        "added_text": ["login", "register"],
        "removed_text": ["home", "dashboard"],
        "change_ratio": 0.8,
        "screen": "Login Screen",
        "confidence": "medium",
    },
    {
        "frame": "frame_0007.jpg",
        "action": "minor_text_change",
        "description": "A small change in visible text was detected.",
        "added_text": ["invalid password"],
        "removed_text": [],
        "change_ratio": 0.1,
        "confidence": "low",
    },
]

test_cases = generate_test_cases(sample_actions)

print("\n========== GENERATED TEST CASES ==========")
pprint(test_cases, sort_dicts=False)