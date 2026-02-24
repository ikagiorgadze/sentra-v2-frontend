# Admin Demo Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an admin-only frontend demo page at `/admin/demo` that reuses the real Sentra chat/result UI but runs fully on configurable mock scenarios.

**Architecture:** Build a dedicated demo feature slice with a local scripted playback engine (`useDemoConversation`) and explicit scenario definitions. Keep production chat path (`/chat`) untouched and reuse existing presentation components (`ConversationPanel`, `RunningState`, `IntelligenceBrief`, `Sidebar`, `RightPanel`) for visual parity. Use frontend-only JWT role gating to allow admin access.

**Tech Stack:** React 18, TypeScript, React Router, Vitest + Testing Library, existing Sentra frontend components.

---

### Task 1: Add demo types and scenario schema

**Files:**
- Create: `sentra-frontend/src/features/sentra/demo/types.ts`
- Create: `sentra-frontend/src/features/sentra/demo/scenarios.ts`
- Test: `sentra-frontend/src/features/sentra/__tests__/demo-scenarios.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import { DEMO_SCENARIOS } from '@/features/sentra/demo/scenarios';

describe('demo scenarios', () => {
  it('exposes at least one valid scenario with script and analysis payload', () => {
    expect(DEMO_SCENARIOS.length).toBeGreaterThan(0);
    for (const scenario of DEMO_SCENARIOS) {
      expect(scenario.id).toBeTruthy();
      expect(scenario.script.length).toBeGreaterThan(0);
      expect(scenario.analysisPayload).toBeDefined();
    }
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/features/sentra/__tests__/demo-scenarios.test.ts`
Expected: FAIL (module/files missing)

**Step 3: Write minimal implementation**

- Add `DemoStep` discriminated union and `DemoScenario` interface.
- Add `DEMO_SCENARIOS` with at least 2 editable scenarios.
- Include step types: `user_message`, `assistant_stream`, `proposal_ready`, `job_start`, `job_complete`.

**Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/features/sentra/__tests__/demo-scenarios.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/sentra/demo/types.ts src/features/sentra/demo/scenarios.ts src/features/sentra/__tests__/demo-scenarios.test.ts
git commit -m "feat: add admin demo scenario schema and seed scenarios"
```

### Task 2: Build demo conversation playback engine

**Files:**
- Create: `sentra-frontend/src/features/sentra/demo/useDemoConversation.ts`
- Test: `sentra-frontend/src/features/sentra/__tests__/use-demo-conversation.test.ts`

**Step 1: Write failing tests**

```ts
it('adds user messages instantly and streams assistant messages incrementally', async () => {
  // render hook, start playback, assert partial assistant content appears before full content
});

it('supports pause/resume and deterministic nextStep/reset', async () => {
  // assert pause freezes cursor, nextStep advances one step, reset clears state
});
```

**Step 2: Run tests to verify failure**

Run: `npm run test:run -- src/features/sentra/__tests__/use-demo-conversation.test.ts`
Expected: FAIL (hook missing / behavior not implemented)

**Step 3: Write minimal implementation**

- Implement state model: selected scenario, cursor, messages, pending proposal, app state, playback state.
- Implement actions: `play`, `pause`, `nextStep`, `reset`, `restartScenario`, `setScenario`.
- Implement token streaming via timer loop and cancellation guards.
- Ensure scenario switch resets playback and state.

**Step 4: Run tests to verify pass**

Run: `npm run test:run -- src/features/sentra/__tests__/use-demo-conversation.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/sentra/demo/useDemoConversation.ts src/features/sentra/__tests__/use-demo-conversation.test.ts
git commit -m "feat: add demo conversation playback engine"
```

### Task 3: Add admin-role decode helper for frontend gating

**Files:**
- Create: `sentra-frontend/src/features/sentra/auth/tokenClaims.ts`
- Test: `sentra-frontend/src/features/sentra/__tests__/token-claims.test.ts`

**Step 1: Write failing tests**

```ts
it('returns admin role when jwt payload contains role=admin', () => {
  // expect getTokenRole(mockToken) === 'admin'
});

it('returns null for malformed token payload', () => {
  // expect getTokenRole('bad.token') === null
});
```

**Step 2: Run tests to verify failure**

Run: `npm run test:run -- src/features/sentra/__tests__/token-claims.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

- Add helper to decode JWT payload safely.
- Export role lookup function used by route guard and sidebar.

**Step 4: Run tests to verify pass**

Run: `npm run test:run -- src/features/sentra/__tests__/token-claims.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/sentra/auth/tokenClaims.ts src/features/sentra/__tests__/token-claims.test.ts
git commit -m "feat: add frontend jwt role claim helper"
```

### Task 4: Create `AdminDemoPage` with shared Sentra layout/components

**Files:**
- Create: `sentra-frontend/src/features/sentra/components/AdminDemoPage.tsx`
- Modify: `sentra-frontend/src/features/sentra/components/ConversationPanel.tsx`
- Test: `sentra-frontend/src/features/sentra/__tests__/admin-demo-page.test.tsx`

**Step 1: Write failing tests**

```tsx
it('renders scenario controls and shared conversation UI', async () => {
  // assert scenario picker, play/pause, next, reset exist
  // assert chat shell visual blocks are rendered
});

it('shows proposal card and transitions to running/results based on demo steps', async () => {
  // drive demo progression and assert running/result components appear
});
```

**Step 2: Run tests to verify failure**

Run: `npm run test:run -- src/features/sentra/__tests__/admin-demo-page.test.tsx`
Expected: FAIL

**Step 3: Write minimal implementation**

- Compose page with `Sidebar`, center panel, `RightPanel`.
- Reuse `ConversationPanel` for message rendering.
- Add demo controls bar and wire to `useDemoConversation`.
- If needed, extend `ConversationPanel` with optional `hideComposer`/`composerDisabled` prop for demo mode.

**Step 4: Run tests to verify pass**

Run: `npm run test:run -- src/features/sentra/__tests__/admin-demo-page.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/sentra/components/AdminDemoPage.tsx src/features/sentra/components/ConversationPanel.tsx src/features/sentra/__tests__/admin-demo-page.test.tsx
git commit -m "feat: add admin demo page with scripted conversation lifecycle"
```

### Task 5: Add admin route and frontend guard behavior

**Files:**
- Modify: `sentra-frontend/src/App.tsx`
- Modify: `sentra-frontend/src/features/sentra/components/AppShell.tsx`
- Test: `sentra-frontend/src/features/sentra/__tests__/admin-demo-routing.test.tsx`

**Step 1: Write failing tests**

```tsx
it('allows admin token users to open /admin/demo', async () => {
  // set admin token, navigate to route, assert page rendered
});

it('redirects non-admin users from /admin/demo to /chat', async () => {
  // set user token, navigate to route, assert redirect
});
```

**Step 2: Run tests to verify failure**

Run: `npm run test:run -- src/features/sentra/__tests__/admin-demo-routing.test.tsx`
Expected: FAIL

**Step 3: Write minimal implementation**

- Register `/admin/demo` route.
- Add role check using token helper.
- Redirect unauthenticated to `/login`; non-admin to `/chat`.

**Step 4: Run tests to verify pass**

Run: `npm run test:run -- src/features/sentra/__tests__/admin-demo-routing.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/App.tsx src/features/sentra/components/AppShell.tsx src/features/sentra/__tests__/admin-demo-routing.test.tsx
git commit -m "feat: add admin-only demo route and role gating"
```

### Task 6: Add admin-only sidebar navigation item

**Files:**
- Modify: `sentra-frontend/src/features/sentra/components/Sidebar.tsx`
- Modify: `sentra-frontend/src/features/sentra/components/AppShell.tsx`
- Test: `sentra-frontend/src/features/sentra/__tests__/sidebar-admin-demo-link.test.tsx`

**Step 1: Write failing test**

```tsx
it('shows Demo nav item only for admin users', () => {
  // render sidebar with admin flag true/false and assert visibility
});
```

**Step 2: Run test to verify failure**

Run: `npm run test:run -- src/features/sentra/__tests__/sidebar-admin-demo-link.test.tsx`
Expected: FAIL

**Step 3: Write minimal implementation**

- Add optional admin flag prop to sidebar.
- Render `Demo` entry only when admin.
- Wire navigation handler from shell.

**Step 4: Run test to verify pass**

Run: `npm run test:run -- src/features/sentra/__tests__/sidebar-admin-demo-link.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/sentra/components/Sidebar.tsx src/features/sentra/components/AppShell.tsx src/features/sentra/__tests__/sidebar-admin-demo-link.test.tsx
git commit -m "feat: add admin-only sidebar demo navigation"
```

### Task 7: Add fallback/error handling for invalid demo scenarios

**Files:**
- Modify: `sentra-frontend/src/features/sentra/demo/useDemoConversation.ts`
- Modify: `sentra-frontend/src/features/sentra/components/AdminDemoPage.tsx`
- Test: `sentra-frontend/src/features/sentra/__tests__/admin-demo-error-guards.test.tsx`

**Step 1: Write failing test**

```tsx
it('shows inline error and blocks playback when scenario is invalid', async () => {
  // inject invalid scenario, assert error banner and disabled controls
});
```

**Step 2: Run test to verify failure**

Run: `npm run test:run -- src/features/sentra/__tests__/admin-demo-error-guards.test.tsx`
Expected: FAIL

**Step 3: Write minimal implementation**

- Add scenario validation in engine.
- Expose validation/error status to page.
- Disable playback actions when invalid.

**Step 4: Run test to verify pass**

Run: `npm run test:run -- src/features/sentra/__tests__/admin-demo-error-guards.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/sentra/demo/useDemoConversation.ts src/features/sentra/components/AdminDemoPage.tsx src/features/sentra/__tests__/admin-demo-error-guards.test.tsx
git commit -m "fix: guard admin demo playback against invalid scenarios"
```

### Task 8: Update frontend README with demo route usage

**Files:**
- Modify: `sentra-frontend/README.md`

**Step 1: Write doc update**

Add section:
- route: `/admin/demo`
- requirement: admin JWT role
- scenario customization file path
- playback controls usage for demos

**Step 2: Verify docs content**

Run: `rg -n "admin/demo|demo scenario|admin role" README.md`
Expected: matching lines present

**Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add admin demo page usage and scenario customization"
```

### Task 9: Final verification and cleanup

**Files:**
- Verify changed files from tasks above

**Step 1: Run targeted test batch**

Run:

```bash
npm run test:run -- \
  src/features/sentra/__tests__/demo-scenarios.test.ts \
  src/features/sentra/__tests__/use-demo-conversation.test.ts \
  src/features/sentra/__tests__/token-claims.test.ts \
  src/features/sentra/__tests__/admin-demo-page.test.tsx \
  src/features/sentra/__tests__/admin-demo-routing.test.tsx \
  src/features/sentra/__tests__/sidebar-admin-demo-link.test.tsx \
  src/features/sentra/__tests__/admin-demo-error-guards.test.tsx
```

Expected: PASS

**Step 2: Run full frontend test sweep (optional but preferred)**

Run: `npm run test:run`
Expected: PASS

**Step 3: Final commit for polish if needed**

```bash
git add -A
git commit -m "chore: finalize admin demo page integration"
```

