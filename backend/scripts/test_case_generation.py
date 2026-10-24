
from app.services.test_case_generator import generate_test_cases

# Reuse the three actions from our successful pipeline test.
sample_actions = [
    {
        "frame": "frame_0001.jpg",
        "action": "initial_screen",
        "description": "Initial screen captured in the recording.",
        "confidence": "medium",
    },
    {
        "frame": "frame_0006.jpg",
        "action": "possible_navigation",
        "description": "Possible screen navigation; verify the triggering action.",
        "confidence": "low",
    },
    {
        "frame": "frame_0007.jpg",
        "action": "possible_navigation",
        "description": "Possible transition to a login or registration screen.",
        "confidence": "low",
    },
]

test_cases = generate_test_cases(sample_actions)

print(f"Generated {len(test_cases)} test cases.")

for test_case in test_cases:
    print("\n" + "=" * 50)
    for key, value in test_case.items():
        print(f"{key}: {value}")
