# AutoTestAI React frontend

A clean React + Vite + Tailwind CSS frontend for the existing AutoTestAI FastAPI backend. Includes dark/light themes, login/register, dashboard, project list/create, and starter pages for video analysis and test cases.

## Prerequisites
- Node.js 20.19+ or 22.12+ recommended
- Your existing FastAPI backend and PostgreSQL database

## Install and run (Windows PowerShell)
1. Extract this folder. You can place it beside your existing `backend` folder; do not delete the backend.
2. Open a terminal in the extracted `autotestai-react` folder.
3. Install dependencies:

   ```powershell
   npm install
   ```

4. Create the local environment file:

   ```powershell
   Copy-Item .env.example .env
   ```

5. Start your existing FastAPI backend in its current terminal, typically at `http://localhost:8000`.
6. Start the frontend:

   ```powershell
   npm run dev
   ```

7. Open `http://localhost:5173`.

## API configuration
By default, `VITE_API_BASE_URL` is `http://localhost:8000/api/v1`. Change `.env` only if your backend base path or port is different. Restart Vite after editing `.env`.

This app expects these known routes:
- `POST /auth/register` with JSON `{ name, email, password }`
- `POST /auth/login` with form-urlencoded `username` and `password`
- `GET /dashboard`
- `GET /projects/`
- `POST /projects/` with JSON `{ name, description, url }`

The project-create payload is intentionally simple. If your existing Pydantic schema uses different required fields, update the payload in `src/pages/Projects.jsx` to match it. Do not change backend models just to match the frontend unless you intend to.

## Authentication note
Login expects a token field named `access_token` or `token` in the successful response. The request interceptor sends it as `Authorization: Bearer ...`. If your backend returns a different token format, adjust `src/context/AuthContext.jsx` and `src/lib/api.js` to match your existing response.

## Build check
```powershell
npm run build
```

## Important scope
The video analysis and test cases pages are starter screens only. They do not claim upload or test-case functionality until the exact existing endpoint schemas are confirmed. The frontend does not modify or migrate the database.

## Test cases page
The `/test-cases` page loads projects, lets you select a project's uploaded video, process it, generate test cases, and read saved cases. If the analysis routes do not appear in `/docs`, include the existing `analysis.router` in your API router. The current backend supports generating and reading case specifications; it does not yet expose test execution/run results.
