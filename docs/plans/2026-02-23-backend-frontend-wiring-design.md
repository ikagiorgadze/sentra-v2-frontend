# Backend-Frontend Wiring Design (Supabase Removal)

## Context

This workspace contains two repositories for one product:

- `sentra-backend`: FastAPI backend with JWT auth and protected `/v1` resources.
- `sentra-frontend`: React frontend with recent redesign work in a worktree branch.

Current problems:

- Backend repository metadata is still rooted at the old parent directory.
- Frontend latest redesign work is not yet in `main`.
- Frontend still includes Supabase auth integration.

## Approved Decisions

1. Backend cleanup path: preserve backend git history and make `sentra-backend/` the real backend repo root.
2. Frontend branch integration: fast-forward `main` to `feat/figma-full-app-redesign`.
3. Auth strategy: remove Supabase entirely and use backend auth only.
4. Signup/login UX: immediate signup + login behavior (no manual activation gate).

## Architecture

- Auth source of truth is backend only:
  - `POST /v1/auth/signup`
  - `POST /v1/auth/login`
- Frontend stores backend JWT and uses it for all protected backend API calls.
- Supabase is fully removed from frontend code, dependencies, and environment config.
- Backend authorization remains via existing JWT guards for protected routes.
- Work starts only after repository hygiene is complete and both repos are aligned on `main`.

## Component Design

### Frontend

- Add auth service layer:
  - `signup`, `login`, `logout`
  - token parse/expiry helpers
- Replace Supabase-based auth state with backend-token-based auth context/state.
- Update route protection to rely on backend JWT state only.
- Add centralized API client with:
  - backend base URL env config
  - bearer token injection
  - standardized error normalization
  - 401 handling (clear session + redirect to login)
- Update login/register screens to call backend auth endpoints directly.

### Backend

- Reuse existing backend JWT auth endpoints and guard dependencies.
- Keep existing protected `/v1` resource routes (jobs, evals, analytics, sentiment, admin).
- Optional hardening after wiring: tighten CORS origins from wildcard to explicit frontend origins.

### Repository Hygiene

- Backend:
  - relocate/reattach git metadata so repo root becomes `sentra-backend/`
  - preserve refs/remotes/history
  - verify integrity after relocation
- Frontend:
  - fast-forward `main` to redesign branch commit
  - clean up completed worktree

## Data Flow

1. User signs up or logs in from frontend auth page.
2. Frontend calls backend auth endpoint (`/v1/auth/signup` or `/v1/auth/login`).
3. Backend returns JWT token payload.
4. Frontend stores JWT and marks user authenticated.
5. Frontend calls protected backend endpoints with `Authorization: Bearer <jwt>`.
6. Backend validates JWT and serves resource data.
7. On token expiry or 401:
  - frontend clears auth state
  - redirects user to login
  - user re-authenticates
8. Logout is frontend-side token/session clearing (stateless JWT model).

## Error Handling

- Auth:
  - invalid credentials -> clear user-facing error
  - duplicate signup email -> clear user-facing error
- API:
  - normalize backend errors into a consistent frontend shape
  - show toasts/messages for recoverable issues
- Session:
  - validate/decode token at startup for expiry checks
  - on auth failure, clear token atomically to avoid partial-auth UI state
- Availability:
  - network/backend outage shows retryable error state, no silent navigation

## Testing and Validation

### Repo Cleanup Validation

- Backend `git rev-parse --show-toplevel` resolves to `sentra-backend/`.
- Frontend `main` points to redesign head via fast-forward (no squash/merge rewrite).
- Worktrees pruned and repo statuses clean.

### Auth Integration Tests

- signup success and duplicate-email behavior
- login success and invalid-credential behavior
- protected route behavior for missing/expired token
- 401 path clears auth and redirects to login

### API Wiring Tests

- bearer token attached to protected requests
- representative endpoint integration:
  - jobs create/list/get
  - at least one analytics/sentiment read
- UI error states for backend 4xx/5xx/network failures

### Regression Checks

- Supabase dependency removed from project
- build, lint, and type checks pass
- smoke flow:
  - login
  - open app
  - create/query workflow
  - load results from backend
  - logout

## Non-Goals

- Adding new product capabilities not required for backend wiring.
- Re-architecting backend domain model beyond auth and integration needs.

