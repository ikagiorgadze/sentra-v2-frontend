# Figma Full-App Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the frontend so visuals and behavior match the Figma Make app (landing/auth/app workspace) with desktop-first pixel accuracy.

**Architecture:** Keep the current React/Vite/Tailwind infrastructure, replace UI and flow with a new Sentra app shell, and wire route entry points to the new flow. Implement in TDD order: tests first, then minimal code, then refactor for fidelity. Reuse existing Supabase/runtime wiring only where needed; remove legacy route surfaces once replacement is stable.

**Tech Stack:** React 18, TypeScript, React Router v6, Tailwind CSS, Recharts, Vitest, React Testing Library, jsdom, ESLint, Vite.

---

**Execution notes**
- Follow `@test-driven-development` for every task.
- Keep commits small and frequent (one commit per task).
- Reuse Figma Make source as implementation reference:
  - `file://figma/make/source/SkVcyYQp58pktS7HcNfA0n/src/app/App.tsx`
  - `file://figma/make/source/SkVcyYQp58pktS7HcNfA0n/src/app/components/*.tsx`
  - `file://figma/make/source/SkVcyYQp58pktS7HcNfA0n/src/styles/theme.css`

### Task 1: Add Frontend Test Infrastructure

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/features/sentra/__tests__/sanity.test.tsx`

**Step 1: Write the failing test**

```tsx
// src/features/sentra/__tests__/sanity.test.tsx
import { describe, it, expect } from 'vitest';

describe('sanity', () => {
  it('runs tests in jsdom', () => {
    expect(document).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/features/sentra/__tests__/sanity.test.tsx`
Expected: FAIL with `Missing script: "test"`

**Step 3: Write minimal implementation**

```json
// package.json (scripts/devDependencies)
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run"
  },
  "devDependencies": {
    "vitest": "^2.1.8",
    "jsdom": "^25.0.1",
    "@testing-library/react": "^16.1.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/user-event": "^14.5.2"
  }
}
```

```ts
// vite.config.ts
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: true,
  },
});
```

```ts
// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
```

**Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/features/sentra/__tests__/sanity.test.tsx`
Expected: PASS (`1 passed`)

**Step 5: Commit**

```bash
git add package.json vite.config.ts src/test/setup.ts src/features/sentra/__tests__/sanity.test.tsx
git commit -m "test: add vitest and rtl setup"
```

### Task 2: Create App Shell State Machine

**Files:**
- Create: `src/features/sentra/types.ts`
- Create: `src/features/sentra/hooks/useSentraAppState.ts`
- Create: `src/features/sentra/__tests__/useSentraAppState.test.ts`

**Step 1: Write the failing test**

```ts
// src/features/sentra/__tests__/useSentraAppState.test.ts
import { describe, it, expect } from 'vitest';
import { createInitialState, transition } from '@/features/sentra/hooks/useSentraAppState';

describe('sentra app state', () => {
  it('moves landing -> auth -> app', () => {
    const s0 = createInitialState();
    const s1 = transition(s0, { type: 'GET_STARTED' });
    const s2 = transition(s1, { type: 'AUTH_SUCCESS' });
    expect(s0.currentView).toBe('landing');
    expect(s1.currentView).toBe('auth');
    expect(s2.currentView).toBe('app');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/features/sentra/__tests__/useSentraAppState.test.ts`
Expected: FAIL with module not found for `useSentraAppState`

**Step 3: Write minimal implementation**

```ts
// src/features/sentra/types.ts
export type AppView = 'landing' | 'auth' | 'app';
export type AppState = 'idle' | 'running' | 'results';

export interface Investigation {
  id: string;
  title: string;
  timestamp: string;
  domain: string;
  query: string;
}

export interface SentraState {
  currentView: AppView;
  appState: AppState;
  query: string;
  investigations: Investigation[];
  currentInvestigationId?: string;
}
```

```ts
// src/features/sentra/hooks/useSentraAppState.ts
import { SentraState } from '@/features/sentra/types';

export function createInitialState(): SentraState {
  return {
    currentView: 'landing',
    appState: 'idle',
    query: '',
    investigations: [],
  };
}

type Event = { type: 'GET_STARTED' } | { type: 'AUTH_SUCCESS' };

export function transition(state: SentraState, event: Event): SentraState {
  if (event.type === 'GET_STARTED') return { ...state, currentView: 'auth' };
  if (event.type === 'AUTH_SUCCESS') return { ...state, currentView: 'app' };
  return state;
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/features/sentra/__tests__/useSentraAppState.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/sentra/types.ts src/features/sentra/hooks/useSentraAppState.ts src/features/sentra/__tests__/useSentraAppState.test.ts
git commit -m "feat: add sentra app shell state transitions"
```

### Task 3: Implement Landing and Auth Flow Components

**Files:**
- Create: `src/features/sentra/components/LandingPage.tsx`
- Create: `src/features/sentra/components/AuthPage.tsx`
- Create: `src/features/sentra/components/AppShell.tsx`
- Create: `src/features/sentra/__tests__/landing-auth-flow.test.tsx`

**Step 1: Write the failing test**

```tsx
// src/features/sentra/__tests__/landing-auth-flow.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { AppShell } from '@/features/sentra/components/AppShell';

describe('landing/auth flow', () => {
  it('opens auth when get started is clicked', async () => {
    const user = userEvent.setup();
    render(<AppShell />);

    await user.click(screen.getByRole('button', { name: /get started/i }));
    expect(screen.getByRole('heading', { name: /welcome back|create your account/i })).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/features/sentra/__tests__/landing-auth-flow.test.tsx`
Expected: FAIL with missing `AppShell`

**Step 3: Write minimal implementation**

```tsx
// src/features/sentra/components/AppShell.tsx
import { useState } from 'react';
import { LandingPage } from './LandingPage';
import { AuthPage } from './AuthPage';

export function AppShell() {
  const [view, setView] = useState<'landing' | 'auth' | 'app'>('landing');

  if (view === 'landing') {
    return <LandingPage onGetStarted={() => setView('auth')} onViewSample={() => setView('app')} />;
  }

  if (view === 'auth') {
    return <AuthPage onAuthenticate={() => setView('app')} />;
  }

  return <div>app</div>;
}
```

```tsx
// src/features/sentra/components/LandingPage.tsx
export function LandingPage({ onGetStarted, onViewSample }: { onGetStarted: () => void; onViewSample: () => void }) {
  return (
    <main>
      <h1>KNOW THE MOOD BEFORE THE HEADLINES HIT</h1>
      <button onClick={onGetStarted}>Get Started</button>
      <button onClick={onViewSample}>View Sample Report</button>
    </main>
  );
}
```

```tsx
// src/features/sentra/components/AuthPage.tsx
export function AuthPage({ onAuthenticate }: { onAuthenticate: () => void }) {
  return (
    <section>
      <h1>Welcome back</h1>
      <button onClick={onAuthenticate}>Sign in</button>
    </section>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/features/sentra/__tests__/landing-auth-flow.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/sentra/components/LandingPage.tsx src/features/sentra/components/AuthPage.tsx src/features/sentra/components/AppShell.tsx src/features/sentra/__tests__/landing-auth-flow.test.tsx
git commit -m "feat: add landing to auth flow in app shell"
```

### Task 4: Implement Query Idle/Running/Results Lifecycle

**Files:**
- Create: `src/features/sentra/components/QueryInput.tsx`
- Create: `src/features/sentra/components/RunningState.tsx`
- Create: `src/features/sentra/components/IntelligenceBrief.tsx`
- Modify: `src/features/sentra/components/AppShell.tsx`
- Create: `src/features/sentra/__tests__/query-lifecycle.test.tsx`

**Step 1: Write the failing test**

```tsx
// src/features/sentra/__tests__/query-lifecycle.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { AppShell } from '@/features/sentra/components/AppShell';

describe('query lifecycle', () => {
  it('moves idle -> running -> results', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<AppShell initialView="app" />);

    await user.type(screen.getByRole('textbox'), 'Sentiment about pension reform');
    await user.keyboard('{Enter}');

    expect(screen.getByText(/collecting public discourse/i)).toBeInTheDocument();
    vi.advanceTimersByTime(3000);
    expect(screen.getByText(/executive summary/i)).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/features/sentra/__tests__/query-lifecycle.test.tsx`
Expected: FAIL (`initialView` prop unsupported or expected content missing)

**Step 3: Write minimal implementation**

```tsx
// AppShell.tsx (core branch)
// - add optional initialView prop
// - add appState ('idle' | 'running' | 'results')
// - render QueryInput / RunningState / IntelligenceBrief by appState
// - set running on submit and use setTimeout(3000) to transition to results
```

```tsx
// QueryInput.tsx
export function QueryInput({ onSubmit }: { onSubmit: (query: string) => void }) {
  return <form onSubmit={(e) => { e.preventDefault(); const q = new FormData(e.currentTarget).get('q')?.toString() ?? ''; if (q.trim()) onSubmit(q); }}><input name="q" type="text" /><button type="submit">Run</button></form>;
}
```

```tsx
// RunningState.tsx
export function RunningState() { return <div>Collecting public discourse -> analyzing -> generating briefing</div>; }
```

```tsx
// IntelligenceBrief.tsx
export function IntelligenceBrief({ query }: { query: string }) { return <section><div>Executive Summary</div><div>{query}</div></section>; }
```

**Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/features/sentra/__tests__/query-lifecycle.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/sentra/components/QueryInput.tsx src/features/sentra/components/RunningState.tsx src/features/sentra/components/IntelligenceBrief.tsx src/features/sentra/components/AppShell.tsx src/features/sentra/__tests__/query-lifecycle.test.tsx
git commit -m "feat: add query lifecycle states"
```

### Task 5: Add Investigation History and Sidebar Selection Behavior

**Files:**
- Create: `src/features/sentra/components/Sidebar.tsx`
- Modify: `src/features/sentra/components/AppShell.tsx`
- Create: `src/features/sentra/__tests__/investigation-history.test.tsx`

**Step 1: Write the failing test**

```tsx
// src/features/sentra/__tests__/investigation-history.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { AppShell } from '@/features/sentra/components/AppShell';

describe('investigation history', () => {
  it('adds completed query to sidebar and reopens it when selected', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<AppShell initialView="app" />);

    await user.type(screen.getByRole('textbox'), 'Pension reform Romania');
    await user.keyboard('{Enter}');
    vi.advanceTimersByTime(3000);

    expect(screen.getByText(/pension reform romania/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /new investigation/i }));
    await user.click(screen.getByRole('button', { name: /pension reform romania/i }));

    expect(screen.getByText(/executive summary/i)).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/features/sentra/__tests__/investigation-history.test.tsx`
Expected: FAIL due missing sidebar/history behavior

**Step 3: Write minimal implementation**

```tsx
// Sidebar.tsx
// - render "New Investigation" button
// - render list of investigation titles as buttons
// - call onSelectInvestigation(id)
```

```tsx
// AppShell.tsx
// - store investigations[] and currentInvestigationId
// - add investigation on result completion
// - reset to idle on "New Investigation"
// - reload selected investigation query into results
```

**Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/features/sentra/__tests__/investigation-history.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/sentra/components/Sidebar.tsx src/features/sentra/components/AppShell.tsx src/features/sentra/__tests__/investigation-history.test.tsx
git commit -m "feat: add sidebar investigation history interactions"
```

### Task 6: Add Right Panel Collapse/Expand and Filters

**Files:**
- Create: `src/features/sentra/components/RightPanel.tsx`
- Modify: `src/features/sentra/components/AppShell.tsx`
- Create: `src/features/sentra/__tests__/right-panel.test.tsx`

**Step 1: Write the failing test**

```tsx
// src/features/sentra/__tests__/right-panel.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { AppShell } from '@/features/sentra/components/AppShell';

describe('right panel', () => {
  it('expands and collapses advanced filters panel', async () => {
    const user = userEvent.setup();
    render(<AppShell initialView="app" />);

    const toggle = screen.getByRole('button', { name: /toggle filters panel/i });
    await user.click(toggle);
    expect(screen.getByText(/advanced filters/i)).toBeInTheDocument();
    await user.click(toggle);
    expect(screen.queryByText(/advanced filters/i)).not.toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/features/sentra/__tests__/right-panel.test.tsx`
Expected: FAIL due missing `RightPanel`

**Step 3: Write minimal implementation**

```tsx
// RightPanel.tsx
// - collapsed by default
// - accessible toggle button (aria-label="Toggle filters panel")
// - render Advanced Filters section only when expanded
```

```tsx
// AppShell.tsx
// - place RightPanel at right side of main app layout
```

**Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/features/sentra/__tests__/right-panel.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/sentra/components/RightPanel.tsx src/features/sentra/components/AppShell.tsx src/features/sentra/__tests__/right-panel.test.tsx
git commit -m "feat: add collapsible right filter panel"
```

### Task 7: Apply Figma Visual Fidelity to Components

**Files:**
- Modify: `src/features/sentra/components/LandingPage.tsx`
- Modify: `src/features/sentra/components/AuthPage.tsx`
- Modify: `src/features/sentra/components/QueryInput.tsx`
- Modify: `src/features/sentra/components/RunningState.tsx`
- Modify: `src/features/sentra/components/IntelligenceBrief.tsx`
- Modify: `src/features/sentra/components/Sidebar.tsx`
- Modify: `src/features/sentra/components/RightPanel.tsx`
- Create: `src/features/sentra/__tests__/visual-content-smoke.test.tsx`

**Step 1: Write the failing test**

```tsx
// src/features/sentra/__tests__/visual-content-smoke.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AppShell } from '@/features/sentra/components/AppShell';

describe('figma content smoke', () => {
  it('renders key figma copy blocks', () => {
    render(<AppShell />);
    expect(screen.getByText(/know the mood before the headlines hit/i)).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/features/sentra/__tests__/visual-content-smoke.test.tsx`
Expected: FAIL until final Figma text/layout is applied

**Step 3: Write minimal implementation**

```tsx
// Replace component markup/classes with Figma Make equivalents from:
// - LandingPage.tsx
// - AuthPage.tsx
// - QueryInput.tsx
// - RunningState.tsx
// - IntelligenceBrief.tsx
// - Sidebar.tsx
// - RightPanel.tsx
// Keep behavior hooks from prior tasks.
```

**Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/features/sentra/__tests__/visual-content-smoke.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/sentra/components/LandingPage.tsx src/features/sentra/components/AuthPage.tsx src/features/sentra/components/QueryInput.tsx src/features/sentra/components/RunningState.tsx src/features/sentra/components/IntelligenceBrief.tsx src/features/sentra/components/Sidebar.tsx src/features/sentra/components/RightPanel.tsx src/features/sentra/__tests__/visual-content-smoke.test.tsx
git commit -m "feat: apply figma-accurate sentra component visuals"
```

### Task 8: Replace Global Theme Tokens and Typography

**Files:**
- Modify: `src/index.css`
- Modify: `tailwind.config.ts`
- Create: `src/features/sentra/__tests__/theme-tokens.test.ts`

**Step 1: Write the failing test**

```ts
// src/features/sentra/__tests__/theme-tokens.test.ts
import { describe, it, expect } from 'vitest';

describe('theme tokens', () => {
  it('exposes sentra css variables', () => {
    document.documentElement.classList.add('dark');
    const styles = getComputedStyle(document.documentElement);
    expect(styles.getPropertyValue('--sentra-cyan').trim()).not.toBe('');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/features/sentra/__tests__/theme-tokens.test.ts`
Expected: FAIL because `--sentra-cyan` is not defined

**Step 3: Write minimal implementation**

```css
/* src/index.css */
:root {
  --sentra-charcoal: #0F1113;
  --sentra-graphite: #2D3033;
  --sentra-cyan: #3FD6D0;
  --sentra-amber: #FFC043;
}
.dark {
  --background: #0F1113;
  --foreground: #E8E8EA;
  --card: #2D3033;
  --border: #3D3F43;
}
```

```ts
// tailwind.config.ts
// map background/foreground/card/border + sentra colors to updated variables
```

**Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/features/sentra/__tests__/theme-tokens.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/index.css tailwind.config.ts src/features/sentra/__tests__/theme-tokens.test.ts
git commit -m "style: align global sentra tokens with figma theme"
```

### Task 9: Route Integration and Legacy Surface Cleanup

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/pages/Index.tsx`
- Modify: `src/pages/Login.tsx`
- Modify: `src/pages/Register.tsx`
- Modify: `src/pages/Chat.tsx`
- Create: `src/features/sentra/__tests__/routes-smoke.test.tsx`

**Step 1: Write the failing test**

```tsx
// src/features/sentra/__tests__/routes-smoke.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import App from '@/App';

describe('route entry points', () => {
  it('renders sentra app shell from root route', () => {
    render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>);
    expect(screen.getByText(/know the mood before the headlines hit/i)).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/features/sentra/__tests__/routes-smoke.test.tsx`
Expected: FAIL until routing is remapped to new shell

**Step 3: Write minimal implementation**

```tsx
// src/pages/Index.tsx, src/pages/Login.tsx, src/pages/Register.tsx, src/pages/Chat.tsx
// - export wrappers around <AppShell initialView="..." /> as needed

// src/App.tsx
// - wire /, /login, /register, /chat, /sample-report to AppShell-based screens
// - remove or park unrelated legacy routes behind non-default paths during migration
```

**Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/features/sentra/__tests__/routes-smoke.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/App.tsx src/pages/Index.tsx src/pages/Login.tsx src/pages/Register.tsx src/pages/Chat.tsx src/features/sentra/__tests__/routes-smoke.test.tsx
git commit -m "feat: remap app routes to figma-aligned sentra shell"
```

### Task 10: Final Verification and Documentation

**Files:**
- Modify: `README.md`
- Create: `docs/plans/2026-02-23-figma-full-app-redesign-verification.md`

**Step 1: Write the failing test**

```md
# docs/plans/2026-02-23-figma-full-app-redesign-verification.md
- [ ] npm run lint passes
- [ ] npm run build passes
- [ ] npm run test:run passes
- [ ] desktop visual checklist at 1440px completed
```

**Step 2: Run test to verify it fails**

Run: `npm run lint && npm run build && npm run test:run`
Expected: FAIL on at least one check before fixes

**Step 3: Write minimal implementation**

```md
# README.md additions
## Validation
- Run lint, build, and tests
- Review desktop at 1440px against Figma source
```

- Fix remaining lint/test/build failures from previous tasks.
- Fill verification checklist with completion notes.

**Step 4: Run test to verify it passes**

Run: `npm run lint && npm run build && npm run test:run`
Expected: PASS for all three commands

**Step 5: Commit**

```bash
git add README.md docs/plans/2026-02-23-figma-full-app-redesign-verification.md
git commit -m "chore: finalize figma parity verification checklist"
```

## Rollout and QA Checklist

1. Validate desktop parity at the primary reference frame (1440 width).
2. Manual smoke test in latest Chrome, Firefox, Safari.
3. Confirm key behaviors from Figma:
   - Landing CTA transitions
   - Auth to app transition
   - Query run lifecycle
   - Investigation history restore
   - Right panel collapse/expand
4. Confirm no dead default routes remain reachable by nav.
5. Tag release after QA sign-off.
