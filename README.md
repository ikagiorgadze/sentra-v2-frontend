# Sentra Frontend

React + Vite client for Sentra. Authentication is handled by the backend JWT API.

## Prerequisites
- Node.js 20+
- npm
- Sentra backend running at `http://localhost:8000` (or another URL you configure)

## Local setup
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
Default dev URL is `http://localhost:5173`.

## Backend wiring
- Signup: `POST /v1/auth/signup`
- Login: `POST /v1/auth/login`
- Jobs: `POST /v1/jobs`, `GET /v1/jobs/{jobId}`, `GET /v1/jobs`
- Analytics:
  - `GET /v1/jobs/{jobId}/overview`
  - `GET /v1/jobs/{jobId}/sentiment-overview`
  - `GET /v1/jobs/{jobId}/sentiment-timeseries`

The frontend stores backend access tokens in local storage and sends `Authorization: Bearer <token>` on protected API calls.

## Test and build
- Run tests: `npm run test:run`
- Build production bundle: `npm run build`

## Local troubleshooting
- `401 Unauthorized` on protected routes:
  - Confirm you logged in successfully and token is present.
  - Confirm backend `JWT_SECRET_KEY` is configured.
- CORS errors in browser:
  - Ensure backend `.env` includes `CORS_ALLOWED_ORIGINS=http://localhost:5173`.
  - Restart backend after env changes.
- Network errors in UI:
  - Verify `VITE_API_BASE_URL` points to a running backend.
