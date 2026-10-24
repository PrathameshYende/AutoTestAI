"""
AutoTestAI generated draft: Verify successful login
Test case: TC-MANUAL-006
Generated locally without an AI API.
"""
import os
import re
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

TEST_CASE_ID = "TC-MANUAL-006"
TEST_TITLE = "Verify successful login"
EXPECTED_RESULT = "The user reaches the successful-login page and sees a success message."
SOURCE_FRAME = ""
TARGET_URL = os.getenv('TARGET_URL', "https://practicetestautomation.com/practice-test-login/")


def test_tc_manual_006_verify_successful_login():
    Path('artifacts').mkdir(exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto(TARGET_URL, wait_until='domcontentloaded')
            expect(page.locator('body')).to_be_visible()
            page.screenshot(
                path=f'artifacts/{TEST_CASE_ID}_initial.png',
                full_page=True,
            )

            # Public practice-site test credentials.
            page.get_by_label('Username').fill('student')
            page.get_by_label('Password').fill('Password123')
            page.get_by_role('button', name='Submit').click()

            expect(page).to_have_url(
                re.compile(r'.*/logged-in-successfully/?$')
            )
            expect(page.get_by_text(
                re.compile(
                    r'Congratulations|successfully logged in',
                    re.IGNORECASE,
                )
            )).to_be_visible()
            expect(page.locator(
                'a:has-text("Log out"), button:has-text("Log out")'
            ).first).to_be_visible()
        finally:
            browser.close()
if __name__ == '__main__':
    test_tc_manual_006_verify_successful_login()     