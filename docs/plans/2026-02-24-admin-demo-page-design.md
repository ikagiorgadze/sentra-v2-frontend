# Admin Demo Page Design

Date: 2026-02-24
Repo: sentra-frontend
Status: Approved

## 1. Goal
Create an admin-only demo page that visually matches the existing chat experience while using fully mocked, scenario-driven data. The demo must simulate:
- conversation between user and Sentra
- proposal confirmation
- job creation lifecycle (running -> completed)
- final analysis/result rendering

This page is temporary and optimized for demo flexibility over long-term security hardening.

## 2. Scope
In scope:
- New admin-only route: `/admin/demo`
- Frontend-only role gating (`role === "admin"` from JWT payload)
- Reuse of existing chat/result components for visual parity
- Scripted scenarios with editable mock data
- Assistant token streaming animation on demo page
- Demo controls: scenario picker, play/pause, next step, reset/restart
- Admin-only sidebar entry to access demo page

Out of scope:
- Backend demo endpoints
- Production security hardening for this route
- Changes to core live-chat backend contracts

## 3. Chosen Architecture
Chosen approach: **Dedicated AdminDemoPage with reused UI components and isolated demo engine**.

### Rationale
- Isolates demo behavior from production chat flow to reduce regression risk.
- Delivers exact visual consistency by reusing existing components.
- Enables fast customization of demo stories via one mock data module.
- Easy to remove later by deleting route + demo feature files.

## 4. Route and Access Design
- Add route: `/admin/demo`.
- Access control is frontend-only:
  - no token -> redirect to `/login`
  - malformed token -> clear token and redirect `/login`
  - token present but role not admin -> redirect `/chat`
  - admin role -> render demo page
- Sidebar displays a `Demo` navigation item only for admin users.

## 5. Demo Data and Engine Design

### 5.1 Scenario Model
Define scenarios in one editable module, e.g. `src/features/sentra/demo/scenarios.ts`.

Each scenario contains:
- `id`, `name`, `description`
- `script: DemoStep[]`
- `analysisPayload` for final result widgets
- optional timing overrides (`tokenDelayMs`, `stepDelayMs`)

### 5.2 DemoStep Types
- `user_message` -> render instantly
- `assistant_stream` -> render token-by-token
- `proposal_ready` -> show existing proposal confirmation card
- `job_start` -> switch to running view
- `job_complete` -> switch to results with scenario analysis payload
- optional pacing helpers like `pause`/`note`

### 5.3 Demo Engine
Create a local hook (e.g. `useDemoConversation`) to orchestrate playback state:
- selected scenario
- step cursor
- message list
- pending proposal
- app state (`idle`, `running`, `results`)
- playback status (`playing`, `paused`)

Engine actions:
- `play`, `pause`, `nextStep`, `reset`, `restartScenario`, `setScenario`
- token streaming with cancellable timer loop
- deterministic transition handling between chat -> running -> results

## 6. UX and Component Reuse
Reuse existing components for exact visual parity:
- `ConversationPanel`
- `ProposalConfirmationCard`
- `RunningState`
- `IntelligenceBrief`
- `Sidebar`
- `RightPanel`

Demo-specific UI controls block in chat column:
- Scenario dropdown
- Play/Pause
- Next Step
- Reset/Restart

Behavior requirements:
- user messages appear instantly
- assistant messages stream in progressively
- confirmation action triggers simulated job lifecycle
- final analysis view uses mock payloads, no backend fetch

## 7. Error Handling and Guardrails
- Validate scenario before playback; show inline demo error if invalid.
- On scenario switch during playback, reset state to step 0.
- Enforce single active timer to avoid double-play races.
- Clear timers on unmount.
- If result payload is incomplete, show fallback values with a small "demo fallback" banner.

## 8. Testing Strategy
Add focused frontend tests for:
1. Route/role gating:
   - admin can access `/admin/demo`
   - non-admin redirected
2. Sidebar visibility:
   - `Demo` nav shown only for admin
3. Playback behavior:
   - instant user message rendering
   - incremental assistant streaming
   - pause/resume correctness
   - deterministic next-step/reset
4. Lifecycle simulation:
   - proposal render
   - confirm -> running
   - completion -> results
5. Scenario switching:
   - clean state reset with no stale timers

## 9. Removal Plan
Because this is temporary, remove by:
- deleting `/admin/demo` route
- deleting demo feature folder (`src/features/sentra/demo/*` + demo page)
- removing sidebar admin demo item

No backend rollback required.
