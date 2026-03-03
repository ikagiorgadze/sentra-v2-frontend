# Landing Chat Entry + Auth Gate Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deliver a landing-first chat CTA where unauthenticated users can draft and send a message, are prompted to authenticate in a popup, and then have that draft auto-sent after successful auth, while authenticated users visiting `/` are routed directly to `/chat`.

**Architecture:** Keep `AppShell` as the single orchestrator for landing/auth/app flow. Introduce a lightweight landing chat state machine (draft + queued send + auth dialog), wire a modal auth surface, and reuse existing chat send pipeline (`handleSendMessage`) for post-auth auto-send. Keep landing informational sections below the new chat hero.

**Tech Stack:** React 18 + TypeScript, React Router v6, Radix Dialog (`src/components/ui/dialog.tsx`), Vitest + Testing Library.

**Implementation references:** @test-driven-development @systematic-debugging @using-git-worktrees

---

### Task 1: Add Landing Chat Hero and Example Chip Prefill

**Files:**
- Modify: `src/features/sentra/components/LandingPage.tsx`
- Test: `src/features/sentra/__tests__/landing-auth-flow.test.tsx`

**Step 1: Write the failing tests**

Add tests asserting:
- landing shows a query textbox and send button for unauthenticated root route,
- clicking an example chip prefills the textbox value without triggering auth view/modal.

```tsx
it('shows landing chat composer for unauthenticated users on /', () => {
  window.history.pushState({}, '', '/');
  clearAccessToken();
  render(<AppShell />);
  expect(screen.getByRole('textbox', { name: /query/i })).toBeInTheDocument();
});

it('prefills landing input when example prompt chip is clicked', async () => {
  window.history.pushState({}, '', '/');
  clearAccessToken();
  const user = userEvent.setup();
  render(<AppShell />);

  await user.click(screen.getByRole('button', { name: /track pension reform sentiment/i }));

  expect(screen.getByRole('textbox', { name: /query/i })).toHaveValue(
    expect.stringMatching(/pension reform/i),
  );
});
```

**Step 2: Run test to verify it fails**

Run:
```bash
npm run test:run -- src/features/sentra/__tests__/landing-auth-flow.test.tsx
```

Expected:
- FAIL on missing landing textbox/chip behavior.

**Step 3: Write minimal implementation**

In `LandingPage.tsx`:
- add controlled chat composer near top-center,
- add static example chip list,
- add new props for draft value, draft change, send handler, and chip prefill callback,
- preserve existing informational sections below hero chat block.

```tsx
interface LandingPageProps {
  onGetStarted: () => void;
  onViewSample: () => void;
  landingDraftMessage: string;
  onLandingDraftChange: (value: string) => void;
  onTrySend: (message: string) => void;
  examplePrompts: string[];
  onSelectExample: (prompt: string) => void;
}
```

**Step 4: Run test to verify it passes**

Run:
```bash
npm run test:run -- src/features/sentra/__tests__/landing-auth-flow.test.tsx
```

Expected:
- PASS for new landing composer and chip prefill assertions.

**Step 5: Commit**

```bash
git add src/features/sentra/components/LandingPage.tsx src/features/sentra/__tests__/landing-auth-flow.test.tsx
git commit -m "feat: add landing chat hero with example chip prefill"
```

---

### Task 2: Add Reusable Auth Dialog Surface for Landing Send Gate

**Files:**
- Create: `src/features/sentra/components/AuthDialog.tsx`
- Modify: `src/features/sentra/components/AuthPage.tsx`
- Test: `src/features/sentra/__tests__/auth-page-backend.test.tsx`

**Step 1: Write the failing tests**

Add tests for dialog behavior:
- renders sign-in form in dialog mode,
- successful login calls `onAuthenticate`,
- errors are shown inline in dialog mode.

```tsx
it('renders auth form inside dialog and authenticates successfully', async () => {
  const onAuthenticate = vi.fn();
  render(<AuthDialog open onOpenChange={vi.fn()} onAuthenticate={onAuthenticate} />);
  // fill email/password + click sign in
  await waitFor(() => expect(onAuthenticate).toHaveBeenCalled());
});
```

**Step 2: Run test to verify it fails**

Run:
```bash
npm run test:run -- src/features/sentra/__tests__/auth-page-backend.test.tsx
```

Expected:
- FAIL because `AuthDialog` does not exist yet.

**Step 3: Write minimal implementation**

- Extract reusable auth form content from `AuthPage` into a shared render path or helper component.
- Keep full-page `AuthPage` UX unchanged.
- Implement `AuthDialog` using Radix dialog primitives (`Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, etc.).

```tsx
export function AuthDialog({ open, onOpenChange, onAuthenticate }: AuthDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign in to continue</DialogTitle>
        </DialogHeader>
        <AuthForm onAuthenticate={onAuthenticate} compact />
      </DialogContent>
    </Dialog>
  );
}
```

**Step 4: Run test to verify it passes**

Run:
```bash
npm run test:run -- src/features/sentra/__tests__/auth-page-backend.test.tsx
```

Expected:
- PASS for existing auth-page tests and new dialog-mode auth tests.

**Step 5: Commit**

```bash
git add src/features/sentra/components/AuthDialog.tsx src/features/sentra/components/AuthPage.tsx src/features/sentra/__tests__/auth-page-backend.test.tsx
git commit -m "feat: add reusable auth dialog for landing send gate"
```

---

### Task 3: Wire AppShell Landing Queue + Auto-Send After Auth

**Files:**
- Modify: `src/features/sentra/components/AppShell.tsx`
- Test: `src/features/sentra/__tests__/landing-auth-flow.test.tsx`

**Step 1: Write the failing tests**

Add/extend tests for full flow:
- authenticated user visiting `/` gets redirected to `/chat`,
- unauthenticated landing send opens auth dialog (not full-page auth switch),
- successful auth closes dialog, routes to `/chat`, and posts queued message once.

```tsx
it('queues landing message, prompts auth modal, and auto-sends after auth', async () => {
  const fetchMock = vi.spyOn(global, 'fetch').mockImplementation(async (input) => {
    const url = String(input);
    // mock /v1/auth/login, /v1/conversations, /v1/conversations/:id/messages
    return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
  });

  render(<AppShell />);
  // type landing query + send -> auth dialog opens
  // complete auth -> expect /chat and messages endpoint called with queued text
  expect(fetchMock.mock.calls.filter(([url]) => String(url).includes('/messages'))).toHaveLength(1);
});
```

**Step 2: Run test to verify it fails**

Run:
```bash
npm run test:run -- src/features/sentra/__tests__/landing-auth-flow.test.tsx
```

Expected:
- FAIL on missing dialog gating and missing queued auto-send behavior.

**Step 3: Write minimal implementation**

In `AppShell.tsx`:
- introduce landing states:

```ts
const [landingDraftMessage, setLandingDraftMessage] = useState('');
const [pendingLandingSend, setPendingLandingSend] = useState<string | null>(null);
const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
```

- route authenticated `/` to `/chat` early,
- implement landing send handler:
  - authenticated: switch to app and call `handleSendMessage(message)`,
  - unauthenticated: set pending + open modal,
- on auth success:
  - close modal,
  - switch to app + `/chat`,
  - send and clear `pendingLandingSend` once.

**Step 4: Run test to verify it passes**

Run:
```bash
npm run test:run -- src/features/sentra/__tests__/landing-auth-flow.test.tsx
```

Expected:
- PASS for redirect, modal gate, and post-auth auto-send tests.

**Step 5: Commit**

```bash
git add src/features/sentra/components/AppShell.tsx src/features/sentra/__tests__/landing-auth-flow.test.tsx
git commit -m "feat: queue landing message and auto-send after auth"
```

---

### Task 4: Prevent Duplicate Auto-Send and Preserve Draft on Cancel/Error

**Files:**
- Modify: `src/features/sentra/components/AppShell.tsx`
- Test: `src/features/sentra/__tests__/landing-auth-flow.test.tsx`

**Step 1: Write the failing tests**

Add tests asserting:
- queued message is consumed once (no duplicate `/messages` call on rerender/effect),
- closing auth dialog keeps landing draft untouched,
- auth failure keeps modal open and preserves draft.

```tsx
it('sends queued landing message only once after auth', async () => {
  // complete auth, then trigger rerender
  // assert /messages called exactly once
});

it('keeps draft when auth dialog closes without login', async () => {
  // close modal and verify textbox still has same draft
});
```

**Step 2: Run test to verify it fails**

Run:
```bash
npm run test:run -- src/features/sentra/__tests__/landing-auth-flow.test.tsx
```

Expected:
- FAIL on duplicate-send or draft-preservation assertions.

**Step 3: Write minimal implementation**

- Guard queued send execution with consume-once logic.
- Clear `pendingLandingSend` before dispatching async send to avoid race duplicates.
- Keep `landingDraftMessage` unchanged on modal cancel and auth error.

```ts
const queued = pendingLandingSend;
if (queued) {
  setPendingLandingSend(null);
  void handleSendMessage(queued);
}
```

**Step 4: Run test to verify it passes**

Run:
```bash
npm run test:run -- src/features/sentra/__tests__/landing-auth-flow.test.tsx
```

Expected:
- PASS on single-send and draft-preservation guarantees.

**Step 5: Commit**

```bash
git add src/features/sentra/components/AppShell.tsx src/features/sentra/__tests__/landing-auth-flow.test.tsx
git commit -m "fix: harden landing queued-send and draft preservation"
```

---

### Task 5: Full Regression Slice for Affected Flows

**Files:**
- Modify (if assertions require copy/text updates): `src/features/sentra/__tests__/routes-smoke.test.tsx`
- Verify: `src/features/sentra/__tests__/landing-auth-flow.test.tsx`
- Verify: `src/features/sentra/__tests__/auth-page-backend.test.tsx`

**Step 1: Run targeted suite for changed flows**

Run:
```bash
npm run test:run -- src/features/sentra/__tests__/landing-auth-flow.test.tsx src/features/sentra/__tests__/auth-page-backend.test.tsx src/features/sentra/__tests__/routes-smoke.test.tsx
```

Expected:
- PASS for all targeted landing/auth/routing tests.

**Step 2: Run broader confidence suite around chat lifecycle**

Run:
```bash
npm run test:run -- src/features/sentra/__tests__/query-lifecycle.test.tsx src/features/sentra/__tests__/chat-confirmation-flow.test.tsx
```

Expected:
- PASS for chat pipeline regressions.

**Step 3: Run full suite and record baseline caveat**

Run:
```bash
npm run test:run
```

Expected:
- Same global status as baseline (known pre-existing failures in admin demo tests unless independently fixed).

**Step 4: Commit final verification/doc touch-ups**

```bash
git add src/features/sentra/__tests__/landing-auth-flow.test.tsx src/features/sentra/__tests__/auth-page-backend.test.tsx src/features/sentra/__tests__/routes-smoke.test.tsx
# include any changed source files from prior tasks if not yet committed
git commit -m "test: cover landing auth-gated chat entry flow"
```

---

## Acceptance Criteria Checklist

- Authenticated `/` traffic lands on `/chat` automatically.
- Unauthenticated `/` shows centered chat composer + example chips.
- Example chips prefill (not auto-send).
- Unauthenticated send opens auth popup.
- Successful popup auth auto-sends queued landing message exactly once.
- Cancel/auth-error preserves landing draft.
- Existing landing informational sections remain below chat hero.
