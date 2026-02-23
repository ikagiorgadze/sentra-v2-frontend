# Backend-Frontend Wiring Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Clean repo structure, bring latest frontend redesign work onto `main`, remove Supabase entirely, and wire frontend auth/data flows to the existing backend JWT-protected API.

**Architecture:** First normalize repository topology so backend and frontend are independent canonical repos. Then integrate redesign branch changes into frontend `main` with a fast-forward-compatible linear history. Finally, replace Supabase auth with backend JWT auth, add a shared API client, and connect key frontend flows to backend endpoints with test-first delivery.

**Tech Stack:** Git worktrees, React 18, TypeScript, Vite, Vitest + React Testing Library, FastAPI, JWT auth, PostgreSQL.

---

**Execution notes**

- Required skills during execution:
  - `@test-driven-development` for all frontend/backend code changes.
  - `@using-git-worktrees` before implementation coding begins.
- Keep one commit per task.
- Do not use destructive git commands.

### Task 1: Normalize Backend Repo Root (History-Preserving)

**Files:**
- Move: `/home/ika/repos/sentra-v2/.git` -> `/home/ika/repos/sentra-v2/sentra-backend/.git`
- Verify only: `/home/ika/repos/sentra-v2/sentra-backend/*`

**Step 1: Verify tracked backend files exactly match relocated tree**

Run:
```bash
cd /home/ika/repos/sentra-v2
tracked=$(git ls-tree -r --name-only HEAD)
mismatch=0
while IFS= read -r p; do
  [ "$(git rev-parse "HEAD:$p")" = "$(git hash-object "sentra-backend/$p")" ] || mismatch=$((mismatch+1))
done <<< "$tracked"
echo "mismatch=$mismatch"
```
Expected: `mismatch=0`

**Step 2: Backup backend git metadata**

Run:
```bash
cd /home/ika/repos/sentra-v2
cp -a .git .git.backup.$(date +%Y%m%d%H%M%S)
```
Expected: backup directory created.

**Step 3: Move git metadata to backend directory**

Run:
```bash
cd /home/ika/repos/sentra-v2
mv .git sentra-backend/.git
```
Expected: `/home/ika/repos/sentra-v2` is no longer a git repo; backend is.

**Step 4: Verify backend repo integrity**

Run:
```bash
cd /home/ika/repos/sentra-v2/sentra-backend
git rev-parse --show-toplevel
git remote -v
git log --oneline -n 5
git status --short --branch
```
Expected:
- toplevel resolves to `.../sentra-backend`
- remote remains backend remote
- history preserved
- status does not show path-relocation breakage

**Step 5: Commit**

No commit expected (metadata move only). Record verification output in task notes.

### Task 2: Bring Frontend Worktree Branch to Main (Fast-Forward-Compatible)

**Files:**
- Modify history only: `sentra-frontend` branch refs
- Remove worktree path: `sentra-frontend/.worktrees/figma-full-app-redesign` (after merge)

**Step 1: Verify feature branch exists and inspect divergence**

Run:
```bash
cd /home/ika/repos/sentra-v2/sentra-frontend
git branch --list feat/figma-full-app-redesign
git log --oneline --left-right --graph main...feat/figma-full-app-redesign -n 20
```
Expected: branch exists and divergence is understood.

**Step 2: Rebase feature branch on main to maintain linear fast-forward path**

Run:
```bash
cd /home/ika/repos/sentra-v2/sentra-frontend
git checkout feat/figma-full-app-redesign
git rebase main
```
Expected: rebase completes cleanly.

**Step 3: Fast-forward main to feature**

Run:
```bash
cd /home/ika/repos/sentra-v2/sentra-frontend
git checkout main
git merge --ff-only feat/figma-full-app-redesign
```
Expected: `main` fast-forwards without merge commit.

**Step 4: Remove completed worktree**

Run:
```bash
cd /home/ika/repos/sentra-v2/sentra-frontend
git worktree remove .worktrees/figma-full-app-redesign
git worktree list
```
Expected: redesign worktree no longer listed.

**Step 5: Commit**

No commit expected (branch operation only). Push updated `main` once implementation milestones are done.

### Task 3: Add Backend API Client Foundation (TDD)

**Files:**
- Create: `src/lib/api/config.ts`
- Create: `src/lib/api/http.ts`
- Create: `src/lib/auth/tokenStorage.ts`
- Create: `src/lib/api/__tests__/http.test.ts`

**Step 1: Write the failing tests**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiFetch } from '@/lib/api/http';
import { setAccessToken, clearAccessToken } from '@/lib/auth/tokenStorage';

describe('apiFetch', () => {
  beforeEach(() => {
    clearAccessToken();
    vi.restoreAllMocks();
  });

  it('adds bearer token when present', async () => {
    setAccessToken('abc.jwt');
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
    await apiFetch('/v1/jobs');
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer abc.jwt');
  });
});
```

**Step 2: Run test to verify it fails**

Run:
```bash
npm run test:run -- src/lib/api/__tests__/http.test.ts
```
Expected: FAIL (missing modules/functions).

**Step 3: Write minimal implementation**

```ts
// src/lib/auth/tokenStorage.ts
const KEY = 'sentra_access_token';
export const getAccessToken = () => sessionStorage.getItem(KEY);
export const setAccessToken = (token: string) => sessionStorage.setItem(KEY, token);
export const clearAccessToken = () => sessionStorage.removeItem(KEY);
```

```ts
// src/lib/api/config.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';
```

```ts
// src/lib/api/http.ts
import { API_BASE_URL } from '@/lib/api/config';
import { getAccessToken } from '@/lib/auth/tokenStorage';

export async function apiFetch(path: string, init: RequestInit = {}) {
  const token = getAccessToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(init.headers as Record<string, string> || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(`${API_BASE_URL}${path}`, { ...init, headers });
}
```

**Step 4: Run test to verify it passes**

Run:
```bash
npm run test:run -- src/lib/api/__tests__/http.test.ts
```
Expected: PASS.

**Step 5: Commit**

```bash
git add src/lib/api/config.ts src/lib/api/http.ts src/lib/auth/tokenStorage.ts src/lib/api/__tests__/http.test.ts
git commit -m "feat: add backend api client foundation"
```

### Task 4: Replace AppShell Auth Screen with Backend Signup/Login (TDD)

**Files:**
- Create: `src/features/sentra/api/auth.ts`
- Modify: `src/features/sentra/components/AuthPage.tsx`
- Create: `src/features/sentra/__tests__/auth-page-backend.test.tsx`

**Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import { AuthPage } from '@/features/sentra/components/AuthPage';

it('logs in via backend and returns token', async () => {
  const user = userEvent.setup();
  const onAuthenticated = vi.fn();
  render(<AuthPage onAuthenticate={onAuthenticated} />);
  await user.type(screen.getByLabelText(/email/i), 'user@example.com');
  await user.type(screen.getByLabelText(/password/i), 'password123');
  await user.click(screen.getByRole('button', { name: /sign in/i }));
  expect(onAuthenticated).toHaveBeenCalled();
});
```

**Step 2: Run test to verify it fails**

Run:
```bash
npm run test:run -- src/features/sentra/__tests__/auth-page-backend.test.tsx
```
Expected: FAIL (backend auth calls not implemented).

**Step 3: Write minimal implementation**

- Add `login` and `signup` functions in `src/features/sentra/api/auth.ts` calling backend `/v1/auth/*`.
- Update `AuthPage` submit handler to call backend auth, persist token via `tokenStorage`, and call `onAuthenticate`.
- Surface backend errors as user-facing messages.

**Step 4: Run test to verify it passes**

Run:
```bash
npm run test:run -- src/features/sentra/__tests__/auth-page-backend.test.tsx
```
Expected: PASS.

**Step 5: Commit**

```bash
git add src/features/sentra/api/auth.ts src/features/sentra/components/AuthPage.tsx src/features/sentra/__tests__/auth-page-backend.test.tsx
git commit -m "feat: wire sentra auth page to backend jwt auth"
```

### Task 5: Gate AppShell by Backend Auth State (TDD)

**Files:**
- Create: `src/features/sentra/hooks/useBackendSession.ts`
- Modify: `src/features/sentra/components/AppShell.tsx`
- Modify: `src/features/sentra/__tests__/landing-auth-flow.test.tsx`

**Step 1: Write the failing test**

Add a test asserting unauthenticated app entry lands on auth view and authenticated state enters app view.

**Step 2: Run test to verify it fails**

Run:
```bash
npm run test:run -- src/features/sentra/__tests__/landing-auth-flow.test.tsx
```
Expected: FAIL for missing backend-session behavior.

**Step 3: Write minimal implementation**

- `useBackendSession` reads/stores token, validates expiry claim, and exposes `isAuthenticated`.
- `AppShell` uses backend session hook to:
  - show auth when token absent/expired
  - move to app when valid token exists
  - clear session on logout

**Step 4: Run test to verify it passes**

Run:
```bash
npm run test:run -- src/features/sentra/__tests__/landing-auth-flow.test.tsx
```
Expected: PASS.

**Step 5: Commit**

```bash
git add src/features/sentra/hooks/useBackendSession.ts src/features/sentra/components/AppShell.tsx src/features/sentra/__tests__/landing-auth-flow.test.tsx
git commit -m "feat: gate app shell with backend jwt session"
```

### Task 6: Remove Supabase from Frontend Codebase (TDD + Build Gate)

**Files:**
- Modify: `package.json`
- Delete: `src/integrations/supabase/client.ts`
- Modify: `src/contexts/UserStateContext.tsx`
- Modify: `src/pages/Login.tsx`
- Modify: `src/pages/Register.tsx`
- Modify: `.env` (local) and create `.env.example` if missing
- Create: `src/lib/auth/__tests__/no-supabase-imports.test.ts`

**Step 1: Write the failing test**

Create a test that scans source content for `@supabase/supabase-js` imports in active code paths.

**Step 2: Run test to verify it fails**

Run:
```bash
npm run test:run -- src/lib/auth/__tests__/no-supabase-imports.test.ts
```
Expected: FAIL with existing Supabase references.

**Step 3: Write minimal implementation**

- Remove `@supabase/supabase-js` from `package.json`.
- Delete/replace Supabase integration module.
- Refactor `UserStateContext`, `Login`, and `Register` to use backend auth client or route wrappers with no Supabase imports.
- Replace env usage with `VITE_API_BASE_URL`.

**Step 4: Run tests and build to verify pass**

Run:
```bash
npm install
npm run test:run -- src/lib/auth/__tests__/no-supabase-imports.test.ts
npm run build
```
Expected: PASS + successful production build.

**Step 5: Commit**

```bash
git add package.json package-lock.json src/contexts/UserStateContext.tsx src/pages/Login.tsx src/pages/Register.tsx src/lib/auth/__tests__/no-supabase-imports.test.ts .env.example
git rm src/integrations/supabase/client.ts
git commit -m "refactor: remove supabase and switch frontend auth to backend"
```

### Task 7: Wire Query Lifecycle to Backend Jobs APIs (TDD)

**Files:**
- Create: `src/features/sentra/api/jobs.ts`
- Modify: `src/features/sentra/components/AppShell.tsx`
- Modify: `src/features/sentra/components/RunningState.tsx`
- Create: `src/features/sentra/__tests__/jobs-api-lifecycle.test.tsx`

**Step 1: Write the failing test**

Test flow:
- submit query
- create job request sent to backend
- app enters running state
- polling fetch updates state to results when backend returns completed.

**Step 2: Run test to verify it fails**

Run:
```bash
npm run test:run -- src/features/sentra/__tests__/jobs-api-lifecycle.test.tsx
```
Expected: FAIL because AppShell still uses timeout-only mocks.

**Step 3: Write minimal implementation**

- Implement `createJob`, `getJob`, and `listJobs` client functions in `jobs.ts`.
- Replace timeout simulation in `AppShell` with backend create + poll logic.
- Keep fallback error UI when polling fails.

**Step 4: Run test to verify it passes**

Run:
```bash
npm run test:run -- src/features/sentra/__tests__/jobs-api-lifecycle.test.tsx
```
Expected: PASS.

**Step 5: Commit**

```bash
git add src/features/sentra/api/jobs.ts src/features/sentra/components/AppShell.tsx src/features/sentra/components/RunningState.tsx src/features/sentra/__tests__/jobs-api-lifecycle.test.tsx
git commit -m "feat: connect sentra query lifecycle to backend jobs api"
```

### Task 8: Wire Results Panels to Backend Analytics/Sentiment Endpoints (TDD)

**Files:**
- Create: `src/features/sentra/api/analytics.ts`
- Modify: `src/features/sentra/components/IntelligenceBrief.tsx`
- Create: `src/features/sentra/__tests__/intelligence-brief-backend.test.tsx`

**Step 1: Write the failing test**

Test that `IntelligenceBrief` renders backend-provided summary and at least one chart from backend data shape.

**Step 2: Run test to verify it fails**

Run:
```bash
npm run test:run -- src/features/sentra/__tests__/intelligence-brief-backend.test.tsx
```
Expected: FAIL because component is mock/static only.

**Step 3: Write minimal implementation**

- Add endpoint clients for:
  - `/v1/jobs/{jobId}/overview`
  - `/v1/jobs/{jobId}/sentiment-overview`
  - `/v1/jobs/{jobId}/sentiment-timeseries`
- Feed fetched data into `IntelligenceBrief` props/state.
- Keep graceful fallback for missing fields.

**Step 4: Run test to verify it passes**

Run:
```bash
npm run test:run -- src/features/sentra/__tests__/intelligence-brief-backend.test.tsx
```
Expected: PASS.

**Step 5: Commit**

```bash
git add src/features/sentra/api/analytics.ts src/features/sentra/components/IntelligenceBrief.tsx src/features/sentra/__tests__/intelligence-brief-backend.test.tsx
git commit -m "feat: render backend analytics and sentiment in intelligence brief"
```

### Task 9: Harden Backend CORS for Frontend Origin (TDD)

**Files:**
- Modify: `../sentra-backend/src/sentra_api/core/config.py`
- Modify: `../sentra-backend/src/sentra_api/main.py`
- Create: `../sentra-backend/tests/unit/core/test_cors_config.py`
- Modify: `../sentra-backend/.env.example`

**Step 1: Write the failing test**

Create test verifying middleware uses configured allowed origins and defaults safely.

**Step 2: Run test to verify it fails**

Run:
```bash
cd /home/ika/repos/sentra-v2/sentra-backend
uv run --extra dev pytest tests/unit/core/test_cors_config.py -q
```
Expected: FAIL (settings not implemented).

**Step 3: Write minimal implementation**

- Add `cors_allowed_origins` setting (comma-separated parsing).
- Use parsed origins in `CORSMiddleware` instead of wildcard.
- Add `.env.example` docs with frontend local origin.

**Step 4: Run test to verify it passes**

Run:
```bash
cd /home/ika/repos/sentra-v2/sentra-backend
uv run --extra dev pytest tests/unit/core/test_cors_config.py -q
```
Expected: PASS.

**Step 5: Commit**

```bash
cd /home/ika/repos/sentra-v2/sentra-backend
git add src/sentra_api/core/config.py src/sentra_api/main.py tests/unit/core/test_cors_config.py .env.example
git commit -m "feat: configure backend cors allowlist for frontend app"
```

### Task 10: Final Integration Verification and Docs

**Files:**
- Modify: `README.md` (frontend)
- Modify: `../sentra-backend/README.md`
- Modify: `docs/plans/2026-02-23-backend-frontend-wiring-design.md` (status links if needed)

**Step 1: Add runbook notes for full local wiring**

Document:
- backend run command
- frontend run command
- required env vars
- login flow and common failure troubleshooting

**Step 2: Run full verification suite**

Run:
```bash
cd /home/ika/repos/sentra-v2/sentra-frontend
npm run test:run
npm run build

cd /home/ika/repos/sentra-v2/sentra-backend
uv run --extra dev pytest -q
```
Expected: all checks pass.

**Step 3: Manual smoke test**

Validate:
- signup + login
- authenticated query create
- running -> results transition with backend data
- logout and forced-auth redirect behavior

**Step 4: Commit**

```bash
cd /home/ika/repos/sentra-v2/sentra-frontend
git add README.md docs/plans/2026-02-23-backend-frontend-wiring-design.md
git commit -m "docs: add frontend-backend wiring runbook updates"

cd /home/ika/repos/sentra-v2/sentra-backend
git add README.md
git commit -m "docs: update backend setup for frontend jwt integration"
```

