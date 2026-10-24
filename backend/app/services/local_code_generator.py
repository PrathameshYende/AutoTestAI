
import json
import re
from typing import Any
from urllib.parse import urlparse


def safe_name(value: str) -> str:
    """Convert a title into a valid Python function name."""
    value = re.sub(r"[^a-zA-Z0-9_]+", "_", value.lower()).strip("_")
    if not value or value[0].isdigit():
        value = f"test_{value}"
    return value[:70]


def generate_playwright_code(
    test_case: dict[str, Any],
    target_url: str | None = None,
) -> dict[str, Any]:
    """Generate a local Playwright test draft without an AI API."""

    title = str(test_case.get("title") or "Generated test")
    case_id = str(test_case.get("test_case_id") or "TC-UNKNOWN")
    description = str(test_case.get("description") or "")
    preconditions = test_case.get("preconditions") or []
    steps = test_case.get("steps") or []
    expected = str(test_case.get("expected_result") or "")
    confidence = str(test_case.get("confidence") or "unknown")
    status = str(test_case.get("status") or "draft")
    source_frame = str(test_case.get("source_frame") or "")

    joined = " ".join(
        [title, description, expected]
        + [str(step) for step in steps]
    ).lower()

    review_reasons = []

    if not target_url:
        review_reasons.append("A target URL has not been provided.")

    if confidence.lower() == "low" or status.lower() == "needs_review":
        review_reasons.append(
            "This test case has low confidence or needs human review."
        )

    # Only use known credentials for this exact public practice site.
    parsed_url = urlparse(target_url or "")
    known_practice_site = (
        parsed_url.scheme in ("http", "https")
        and parsed_url.hostname == "practicetestautomation.com"
        and parsed_url.path.rstrip("/") == "/practice-test-login"
    )

    is_login_test = "login" in joined or "log in" in joined

    url_literal = json.dumps(target_url or "http://localhost:3000")
    title_literal = json.dumps(title)
    expected_literal = json.dumps(expected)
    case_id_literal = json.dumps(case_id)
    frame_literal = json.dumps(source_frame)

    function_name = safe_name(f"test_{case_id}_{title}")

    lines = [
        '"""',
        f"AutoTestAI generated draft: {title}",
        f"Test case: {case_id}",
        "Generated locally without an AI API.",
        '"""',
        "import os",
        "import re",
        "from pathlib import Path",
        "from playwright.sync_api import sync_playwright, expect",
        "",
        f"TEST_CASE_ID = {case_id_literal}",
        f"TEST_TITLE = {title_literal}",
        f"EXPECTED_RESULT = {expected_literal}",
        f"SOURCE_FRAME = {frame_literal}",
        f"TARGET_URL = os.getenv('TARGET_URL', {url_literal})",
        "",
        "",
        f"def {function_name}():",
        "    Path('artifacts').mkdir(exist_ok=True)",
        "    with sync_playwright() as p:",
        "        browser = p.chromium.launch(headless=True)",
        "        page = browser.new_page()",
        "        try:",
        "            page.goto(TARGET_URL, wait_until='domcontentloaded')",
        "            expect(page.locator('body')).to_be_visible()",
        "            page.screenshot(",
        "                path=f'artifacts/{TEST_CASE_ID}_initial.png',",
        "                full_page=True,",
        "            )",
    ]

    if known_practice_site and is_login_test:
        lines.extend([
            "",
            "            # Public practice-site test credentials.",
            "            page.get_by_label('Username').fill('student')",
            "            page.get_by_label('Password').fill('Password123')",
            "            page.get_by_role('button', name='Submit').click()",
            "",
            "            expect(page).to_have_url(",
            "                re.compile(r'.*/logged-in-successfully/?$')",
            "            )",
            "            expect(page.get_by_text(",
            "                re.compile(",
            "                    r'Congratulations|successfully logged in',",
            "                    re.IGNORECASE,",
            "                )",
            "            )).to_be_visible()",
            "            expect(page.locator(",
            "                'a:has-text(\"Log out\"), button:has-text(\"Log out\")'",
            "            ).first).to_be_visible()",
        ])
    else:
        review_reasons.append(
            "No verified site-specific interaction template matched. "
            "Review the page selectors and add appropriate actions."
        )
        lines.extend([
            "",
            "            # TODO: Add verified user actions and assertions.",
            "            # Do not invent selectors or expected outcomes.",
        ])

    lines.extend([
        "        finally:",
        "            browser.close()",
        "",
        "",
        "if __name__ == '__main__':",
        f"    {function_name}()",
        "",
    ])

    return {
        "test_case_id": case_id,
        "title": title,
        "language": "python",
        "framework": "playwright",
        "code": "\n".join(lines),
        "requires_review": bool(review_reasons),
        "review_reasons": review_reasons,
        "preconditions": preconditions,
        "description": description,
        "expected_result": expected,
    }
