# AutoTestAI frontend integration update

This frontend bundle keeps the existing design system and connects the core implemented flows to the FastAPI backend.

## Backend URL
`frontend/index.html` currently configures:
`http://localhost:8000/api`

The API client appends `/v1`, so the actual API base is:
`http://localhost:8000/api/v1`

## Connected flows
- Login: `POST /auth/login` using form-encoded `username` (email) and `password`; saves the returned JWT in localStorage.
- Projects: list/create/delete using `/projects/` and `/projects/{project_id}`.
- Video upload: `POST /videos/{project_id}` using multipart form data.
- Video processing: `POST /videos/{video_id}/process`.
- Saved test cases: `GET /analysis/test-cases/{video_id}`.
- Test-case generation: `POST /analysis/test-cases/{video_id}`.

The latest video ID is stored locally as `autotest_last_video_id` so the Test Cases screen can load its saved cases.

## Run
1. Start the backend from the backend folder with your normal Uvicorn command.
2. Start the frontend with:
   `powershell -ExecutionPolicy Bypass -File .\serve.ps1`
3. Open `http://localhost:5173`.
4. Sign in, open Projects, create a project, upload a short video, extract frames, then generate test cases.

## Important limitations
Several original prototype screens (dashboard metrics, workflow builder, test runs, Jira, self-healing, analytics, team/settings) call endpoints that are not implemented in the current backend. Those screens are retained for the existing design, but their API requests will not work until corresponding backend endpoints are built. This bundle does not fabricate results for those routes.

AI test-case generation may take a while or fail if the local vision/Ollama pipeline is unavailable. Generated cases should be reviewed; they are drafts, not proof that browser automation tests have executed.
