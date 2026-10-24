# AutoTestAI Automation Code Generation — Integration Guide

This patch adds a protected FastAPI endpoint that generates a **draft** Python Playwright or Selenium script from an existing saved test case. It uses the existing PostgreSQL `TestCase`, `Video`, and `Project` models, and checks that the signed-in user owns the video. It does not change your auth routes or database schema.

## What's included

- `autotestai-react/` — updated React frontend with an **Automation code** sidebar page, project/video/test-case selectors, optional target URL, framework selection, generated-code preview, copy, and `.py` download.
- `backend_patch/app/api/v1/endpoints/automation.py` — new backend route `POST /api/v1/automation/generate/{video_id}`.
- `backend_patch/main.py.integration.txt` — two lines to add to your existing `backend/app/main.py`.

## 1. Update the frontend

1. Back up your current `autotestai-react` folder.
2. Copy the contents of the included `autotestai-react` folder into your existing frontend folder, allowing the included `src` files to be updated. Keep your existing `.env` and `node_modules`.
3. The API base remains `VITE_API_BASE_URL=http://localhost:8000/api/v1`.

## 2. Add the backend endpoint without replacing existing files

1. Copy `backend_patch/app/api/v1/endpoints/automation.py` to `backend/app/api/v1/endpoints/automation.py`.
2. Open your existing `backend/app/main.py`. Do **not** replace it. Add this import beside your other endpoint imports:

   `from app.api.v1.endpoints.automation import router as automation_router`

3. After your existing `app.include_router(...)` calls, add:

   `app.include_router(automation_router, prefix="/api/v1")`

   The existing Analysis router and all current routes must remain in place.

## 3. Configure OpenAI on the backend only

Add these to `backend/.env` (do not commit or share your real key):

```dotenv
OPENAI_API_KEY=your_real_api_key_here
OPENAI_MODEL=gpt-4.1-mini
```

The endpoint loads `.env` through `python-dotenv` when available. If it isn't installed in the backend environment, install it in the backend venv:

```powershell
pip install python-dotenv
```

Keep the key on the backend. Do not put it in frontend `.env` as a `VITE_` variable.

Restart FastAPI after adding the route and key. Then check `http://localhost:8000/docs` for the **Automation** section.

## 4. Start the frontend

```powershell
cd C:\Users\yende\Desktop\AutoTestAI\autotestai-react
npm run dev
```

Sign in, open **Automation code**, choose a project, recording, and saved test case, optionally enter the target URL, select a framework, and click **Generate automation code**. You can copy or download the returned script.

## Important limitations and safety

- This feature generates code; it does **not execute** generated code and does not claim test Passed/Failed.
- The URL is generation context only in this version. It does not crawl or inspect a live website yet. True URL-driven browser exploration is a later module.
- When no URL is supplied, the script should read `TARGET_URL` from the environment. The generated code must be reviewed before execution.
- Low-confidence or `needs_review` test cases display a review warning.
- The backend includes the saved source frame image as optional vision context if `uploads/frames/video_<id>/<source_frame>` exists.
- The endpoint requires a valid signed-in user and checks video ownership before retrieving a case.
- No new database table or schema migration is needed.

## Endpoint request

`POST /api/v1/automation/generate/{video_id}`

```json
{
  "test_case_id": "1",
  "target_url": "https://example.com/login",
  "source": "both",
  "framework": "playwright"
}
```

`test_case_id` can be the database integer ID as a string (e.g. `"1"`) or public ID (e.g. `"TC-001"`). `source` is `recording`, `url`, or `both`; `framework` is `playwright` or `selenium`.
