from typing import Any


def generate_test_cases(
    inferred_actions: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """
    Convert inferred UI changes into structured test cases.

    Generated cases are drafts until their behavior is verified.
    Confidence is inherited from action inference, not invented here.
    """

    test_cases = []

    for index, action_data in enumerate(inferred_actions, start=1):
        action_type = action_data.get("action", "unknown")
        description = action_data.get(
            "description",
            "No action description available.",
        )
        frame = action_data.get("frame", "")
        confidence = action_data.get("confidence", "low")

        # Treat missing or invalid confidence conservatively.
        if confidence not in {"high", "medium", "low"}:
            confidence = "low"

        # No generated case is considered verified automatically.
        status = "draft" if (
            action_type == "initial_screen"
            and confidence == "high"
        ) else "needs_review"

        if action_type == "initial_screen":
            title = "Verify initial application screen"

            preconditions = [
                "The recorded application or website is available.",
                "The recording has reached its initial captured frame.",
            ]

            steps = [
                f"Inspect the initial screen in {frame}.",
                "Compare the visible elements with the original recording.",
            ]

            expected_result = (
                "The initial screen matches the recorded reference. "
                "Confirm the expected behavior before approving this case."
            )

        elif action_type in {
            "ui_change",
            "minor_text_change",
            "possible_navigation",
        }:
            screen = action_data.get("screen", "")
            added_text = action_data.get("added_text", [])
            removed_text = action_data.get("removed_text", [])
            change_ratio = action_data.get("change_ratio")

            if action_type == "possible_navigation":
                title = "Review possible screen navigation"
            elif action_type == "minor_text_change":
                title = "Review minor visible text change"
            else:
                title = "Verify visible UI change"

            preconditions = [
                "The application is displaying the preceding recorded state.",
                f"The current reference frame is {frame}.",
            ]

            steps = [
                "Inspect the current frame and its preceding frame.",
            ]

            if added_text:
                steps.append(
                    "Verify newly detected text: "
                    + ", ".join(added_text[:10])
                    + "."
                )

            if removed_text:
                steps.append(
                    "Check whether previously visible text disappeared: "
                    + ", ".join(removed_text[:10])
                    + "."
                )

            steps.append(
                "Compare both frames with the original recording and "
                "confirm what caused the change."
            )

            expected_result = (
                "The observed UI change matches the original recording. "
                "Do not approve the case until the behavior is verified."
            )

            if screen:
                description += (
                    f" Vision AI described the current screen as: {screen}."
                )

            if isinstance(change_ratio, (int, float)):
                description += (
                    f" Normalized OCR change ratio: {change_ratio:.3f}."
                )

        else:
            title = "Review captured UI state"

            preconditions = [
                "The recorded application or website is available.",
            ]

            steps = [
                f"Inspect the captured frame {frame}.",
                "Determine and document the behavior supported by the recording.",
            ]

            expected_result = (
                "The observed behavior is documented and manually verified."
            )

        test_cases.append({
            "test_case_id": f"TC-{index:03d}",
            "title": title,
            "source_frame": frame,
            "action_type": action_type,
            "description": description,
            "preconditions": preconditions,
            "steps": steps,
            "expected_result": expected_result,
            "confidence": confidence,
            "status": status,
        })

    return test_cases