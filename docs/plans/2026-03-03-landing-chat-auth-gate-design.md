# Landing Chat Entry + Auth Gate Design

**Date:** 2026-03-03  
**Status:** Approved

## Goal

Increase landing-page engagement by placing a chat composer in the center of the first viewport, while preserving the main marketing information below it. Unauthenticated users should be able to type a message and click send, then be prompted with an authentication popup. After successful authentication, the queued landing message should be automatically sent in the chat experience.

## Confirmed Product Decisions

1. Authenticated users visiting `/` should be redirected directly to `/chat` (ChatGPT-like behavior).
2. Unauthenticated users visiting `/` should see the landing page with a centered chat entry section.
3. Sending from landing while unauthenticated should open a login/signup popup.
4. After successful auth from that popup, the queued landing message should auto-send into chat.
5. Landing should include clickable example prompts that prefill the input (not immediate send).

## Approach Options Considered

### Option 1: Extend `AppShell` flow (selected)

Reuse current `AppShell` as the single orchestration point for `landing` / `auth` / `app` flow. Add landing-draft and pending-send state, plus auth dialog handling from landing.

**Why selected:** Lowest architectural churn, best fit with existing route/view state and chat send pipeline, smallest regression surface.

### Option 2: Separate landing-chat page with state handoff

Create a dedicated `LandingChatPage` that owns auth popup and passes draft to `/chat` via navigation state/session storage.

**Tradeoff:** Cleaner separation but introduces handoff complexity and more moving parts.

### Option 3: Reuse full `ConversationPanel` on landing

Embed chat panel directly in landing with gated actions.

**Tradeoff:** Fast visual reuse but risks coupling public landing and authenticated chat internals too tightly.

## UX and Interaction Design

### Authenticated path

- If user is authenticated and opens `/`, immediately redirect to `/chat` and show full app chat.

### Unauthenticated landing

- Top viewport features a centered chat entry block as the primary CTA.
- Example prompt chips appear near composer to accelerate first interaction.
- Existing landing informational sections remain below the chat block.

### Send and auth-gate behavior

1. User types message on landing and presses send.
2. If unauthenticated, app stores pending message and opens auth modal.
3. If auth succeeds, app closes modal, routes to chat, and auto-sends stored message.
4. If auth fails or modal closes, draft message remains available for retry.

## Component and State Design

### `AppShell`

Add landing-gate state:

- `landingDraftMessage: string`
- `pendingLandingSend: string | null`
- `isAuthDialogOpen: boolean`

New flow responsibilities:

- Redirect authenticated `/` traffic to `/chat`.
- Handle landing send intent based on auth state.
- Execute queued send post-auth by reusing existing send logic.
- Ensure pending send is consumed once to avoid duplicate send.

### `LandingPage`

Update props/behavior:

- Controlled draft value and change handler.
- `onTrySend(message)` callback.
- Example prompt list and selection callback.
- Keep current informational content sections below hero chat section.

### Auth modal

- Use existing dialog primitives in `src/components/ui/dialog.tsx`.
- Reuse backend auth logic from current auth flow (avoid duplicate API semantics).
- Surface inline auth errors in modal.

## Data Flow

1. Landing input/chip updates `landingDraftMessage`.
2. Send attempt on landing:
   - Authenticated: route to app chat and send now.
   - Unauthenticated: set `pendingLandingSend`, open auth modal.
3. Modal auth success:
   - set token/session,
   - close modal,
   - move to app/chat route,
   - dispatch `pendingLandingSend` through existing `handleSendMessage`,
   - clear pending value.

## Error Handling

- Auth failure: modal remains open with error; draft and pending message preserved.
- Modal dismissed: stay on landing; draft preserved.
- Auto-send failure after auth: rely on existing assistant error bubble path in chat; no silent loss.
- Duplicate prevention: clear `pendingLandingSend` immediately after dispatch.

## Testing Strategy

### Update existing tests

- `src/features/sentra/__tests__/landing-auth-flow.test.tsx`
  - unauthenticated landing shows centered composer,
  - send opens auth dialog,
  - successful auth auto-navigates and auto-sends queued message,
  - authenticated `/` redirects to `/chat`.

### Add focused behavior test

- Example chip click prefills landing input without sending.

### Regression expectations

- Existing protected app-route behavior remains intact.
- Existing sample-report navigation from landing remains intact.

## Known Baseline Caveat

At design time, baseline test run in this worktree reports 2 pre-existing failures unrelated to this feature:

- `src/features/sentra/__tests__/admin-demo-routing.test.tsx`
- `src/features/sentra/__tests__/admin-demo-page.test.tsx`

Feature verification should isolate landing/auth/chat-entry behavior and avoid conflating with those unrelated failures.
