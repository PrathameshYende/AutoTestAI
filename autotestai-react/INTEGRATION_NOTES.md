# Integration checklist

- [ ] Confirm `http://localhost:8000/docs` is reachable.
- [ ] Confirm `/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/dashboard`, and `/api/v1/projects/` match the frontend base URL.
- [ ] Confirm CORS in FastAPI allows `http://localhost:5173`.
- [ ] Check the login response includes `access_token` or `token`.
- [ ] Check the projects POST schema; edit `src/pages/Projects.jsx` if required fields differ.
- [ ] Replace the starter video analysis and test cases screens only after confirming existing backend endpoints and request fields.

No database migrations or backend files are included in this frontend starter.


## Test cases integration added

The Test cases page uses these existing backend routes (under `/api/v1`):
- `GET /projects/`
- `GET /videos/project/{project_id}`
- `POST /videos/{video_id}/process`
- `GET /analysis/test-cases/{video_id}`
- `POST /analysis/test-cases/{video_id}`

The page displays saved test-case specifications, including preconditions, steps, expected result, confidence, status and created time. It does not show pass/fail execution results because the backend code inspected for this integration does not expose an execution endpoint. Ensure `analysis.router` is included in `backend/app/api/v1/router.py` if `/analysis/test-cases/{video_id}` is missing from Swagger. No backend or database files were modified.
