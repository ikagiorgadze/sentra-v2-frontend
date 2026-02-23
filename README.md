# Sentra Frontend

React + Vite client for Sentra. Authentication is handled by the backend JWT API.

## Prerequisites
- Node.js 20+
- npm
- Sentra backend running and reachable at `http://localhost:8000` (or another URL you configure)

## Quickstart
Run all commands from repo root:

```bash
cd /home/ika/repos/sentra-v2/sentra-frontend
```

1. Install dependencies:
```bash
npm install
```
2. Configure environment:
```bash
cp .env.example .env
```
3. Set backend base URL in `.env`:
```bash
VITE_API_BASE_URL="http://localhost:8000"
```
4. Start the app:
```bash
npm run dev
```
5. Open frontend:
- `http://localhost:5173`

Default API target is your `.env` value (`VITE_API_BASE_URL`).

## Local Run Order (Backend + Frontend)
1. Start backend infra and API first (from backend repo):
```bash
cd /home/ika/repos/sentra-v2/sentra-backend
docker compose up -d
uv run alembic upgrade head
uv run uvicorn sentra_api.main:app --app-dir src --reload
```
2. Start frontend (from this repo):
```bash
cd /home/ika/repos/sentra-v2/sentra-frontend
npm run dev
```

## Backend wiring
- Auth:
  - `POST /v1/auth/signup`
  - `POST /v1/auth/login`
- Jobs:
  - `POST /v1/jobs`
  - `GET /v1/jobs/{jobId}`
  - `GET /v1/jobs`
- Analytics:
  - `GET /v1/jobs/{jobId}/overview`
  - `GET /v1/jobs/{jobId}/sentiment-overview`
  - `GET /v1/jobs/{jobId}/sentiment-timeseries`

The frontend stores backend access tokens in local storage and sends `Authorization: Bearer <token>` on protected API calls.

## Test and build
- Run tests:
```bash
npm run test:run
```
- Build production bundle:
```bash
npm run build
```

## Troubleshooting
- `401 Unauthorized` on protected routes:
  - Confirm you logged in successfully and token is present.
  - Confirm backend `JWT_SECRET_KEY` is configured.
- `password authentication failed for user ...` from backend while frontend is running:
  - Backend DB credentials in backend `.env` do not match `docker-compose.yml`.
  - Use backend DB URLs for `sentra:sentra@localhost:5432/sentra`, then rerun migrations.
- CORS errors in browser:
  - Ensure backend `.env` includes `CORS_ALLOWED_ORIGINS=http://localhost:5173`.
  - Restart backend after env changes.
- Network errors in UI:
  - Verify `VITE_API_BASE_URL` points to a running backend.
  - Verify backend health endpoint responds (`http://localhost:8000/v1/health`).
- Frontend starts but login/signup does nothing:
  - Check browser devtools Network tab for `/v1/auth/login` or `/v1/auth/signup` failures.
  - Confirm backend is on the same base URL as `VITE_API_BASE_URL`.
