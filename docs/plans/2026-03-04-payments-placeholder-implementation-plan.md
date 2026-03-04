# Payments Placeholder Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add public `/pricing` and `/checkout` placeholder pages with a single `Paid Plan` priced at `$20/mo`, and expose pricing entry points from both landing header and app sidebar.

**Architecture:** Keep this frontend-only and route-driven. Create standalone `PricingPage` and `CheckoutPlaceholderPage` components and wire them directly in `App.tsx`. Use placeholder-only copy and client-side route navigation, with no payment SDK, API, or entitlement changes.

**Tech Stack:** React 18 + TypeScript, React Router v6, Tailwind CSS, Vitest + Testing Library.

---

### Task 1: Add Failing Route + Flow Tests For `/pricing` And `/checkout`

**Files:**
- Create: `src/features/sentra/__tests__/pricing-checkout-routes.test.tsx`

**Step 1: Write the failing test**

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from '@/App';

describe('pricing and checkout routes', () => {
  it('renders pricing route with paid plan placeholder', () => {
    window.history.pushState({}, '', '/pricing');
    render(<App />);

    expect(screen.getByRole('heading', { name: /paid plan/i })).toBeInTheDocument();
    expect(screen.getByText('$20/mo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue to checkout/i })).toBeInTheDocument();
  });

  it('navigates from pricing to checkout placeholder', async () => {
    window.history.pushState({}, '', '/pricing');
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /continue to checkout/i }));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/checkout');
    });
    expect(screen.getByRole('heading', { name: /checkout placeholder/i })).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/features/sentra/__tests__/pricing-checkout-routes.test.tsx`
Expected: FAIL because `/pricing` and `/checkout` pages are not implemented.

**Step 3: Commit the failing test**

```bash
git add src/features/sentra/__tests__/pricing-checkout-routes.test.tsx
git commit -m "test: add failing pricing and checkout route tests"
```

### Task 2: Implement Placeholder Pages And Route Wiring

**Files:**
- Create: `src/features/sentra/components/PricingPage.tsx`
- Create: `src/features/sentra/components/CheckoutPlaceholderPage.tsx`
- Modify: `src/App.tsx`

**Step 1: Implement minimal Pricing page**

```tsx
// PricingPage.tsx (structure)
import { useNavigate } from 'react-router-dom';

export function PricingPage() {
  const navigate = useNavigate();
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-3xl">Pricing</h1>
        <div className="mt-8 rounded-lg border border-border bg-card p-8">
          <h2 className="text-2xl">Paid Plan</h2>
          <p className="mt-2 text-4xl">$20/mo</p>
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            <li>Placeholder feature 1</li>
            <li>Placeholder feature 2</li>
            <li>Placeholder feature 3</li>
            <li>Placeholder feature 4</li>
          </ul>
          <p className="mt-6 text-xs text-muted-foreground">
            Checkout is placeholder-only in this build. No real charges are processed.
          </p>
          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="mt-6 rounded bg-[#3FD6D0] px-4 py-2 text-sm text-[#0F1113]"
          >
            Continue to Checkout
          </button>
        </div>
      </main>
    </div>
  );
}
```

**Step 2: Implement minimal Checkout placeholder page**

```tsx
// CheckoutPlaceholderPage.tsx (structure)
import { Link } from 'react-router-dom';

export function CheckoutPlaceholderPage() {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl">Checkout Placeholder</h1>
        <div className="mt-8 rounded-lg border border-border bg-card p-8">
          <p>Plan: Paid Plan</p>
          <p>Price: $20/mo</p>
          <p className="mt-2 font-semibold">Total: $20</p>
          <p className="mt-6 text-xs text-muted-foreground">
            Payments are not live yet. This is a placeholder flow.
          </p>
          <Link to="/pricing" className="mt-6 inline-block rounded border border-border px-4 py-2 text-sm">
            Back to Pricing
          </Link>
        </div>
      </main>
    </div>
  );
}
```

**Step 3: Wire routes in App.tsx**

```tsx
// Add imports
import { PricingPage } from '@/features/sentra/components/PricingPage';
import { CheckoutPlaceholderPage } from '@/features/sentra/components/CheckoutPlaceholderPage';

// Add routes before fallback
<Route path="/pricing" element={<PricingPage />} />
<Route path="/checkout" element={<CheckoutPlaceholderPage />} />
```

**Step 4: Run tests to verify pass**

Run: `npm run test:run -- src/features/sentra/__tests__/pricing-checkout-routes.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/features/sentra/components/PricingPage.tsx src/features/sentra/components/CheckoutPlaceholderPage.tsx src/App.tsx
git commit -m "feat: add pricing and checkout placeholder routes"
```

### Task 3: Add Landing Header Pricing Entry

**Files:**
- Create: `src/features/sentra/__tests__/landing-pricing-link.test.tsx`
- Modify: `src/features/sentra/components/LandingPage.tsx`

**Step 1: Write failing test for pricing entry in landing header**

```tsx
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { LandingPage } from '@/features/sentra/components/LandingPage';

describe('landing pricing link', () => {
  it('renders a Pricing link to /pricing in header', () => {
    render(
      <BrowserRouter>
        <LandingPage
          onGetStarted={vi.fn()}
          onViewSample={vi.fn()}
          landingDraftMessage=""
          onLandingDraftChange={vi.fn()}
          onTrySend={vi.fn()}
          examplePrompts={[]}
          onSelectExample={vi.fn()}
        />
      </BrowserRouter>,
    );

    const pricingLink = screen.getByRole('link', { name: /pricing/i });
    expect(pricingLink).toHaveAttribute('href', '/pricing');
  });
});
```

**Step 2: Run test to verify failure**

Run: `npm run test:run -- src/features/sentra/__tests__/landing-pricing-link.test.tsx`
Expected: FAIL because pricing link is absent.

**Step 3: Add Pricing link in landing header**

```tsx
// In LandingPage header actions
<Link
  to="/pricing"
  className="rounded border border-border px-4 py-2 text-sm transition-colors hover:border-[#3FD6D0]"
>
  Pricing
</Link>
```

Keep existing `Sign in` button unchanged.

**Step 4: Run tests to verify pass**

Run: `npm run test:run -- src/features/sentra/__tests__/landing-pricing-link.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/features/sentra/__tests__/landing-pricing-link.test.tsx src/features/sentra/components/LandingPage.tsx
git commit -m "feat: add pricing link in landing header"
```

### Task 4: Add Sidebar Pricing Entry

**Files:**
- Create: `src/features/sentra/__tests__/sidebar-pricing-link.test.tsx`
- Modify: `src/features/sentra/components/Sidebar.tsx`

**Step 1: Write failing test for sidebar pricing entry**

```tsx
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { Sidebar } from '@/features/sentra/components/Sidebar';

describe('sidebar pricing link', () => {
  it('renders Pricing link to /pricing', () => {
    render(
      <BrowserRouter>
        <Sidebar
          recentChats={[]}
          onNewInvestigation={vi.fn()}
          onSelectChat={vi.fn()}
        />
      </BrowserRouter>,
    );

    const pricingLink = screen.getByRole('link', { name: /pricing/i });
    expect(pricingLink).toHaveAttribute('href', '/pricing');
  });
});
```

**Step 2: Run test to verify failure**

Run: `npm run test:run -- src/features/sentra/__tests__/sidebar-pricing-link.test.tsx`
Expected: FAIL because pricing link is absent.

**Step 3: Add sidebar pricing link UI**

```tsx
// In Sidebar top action block, under New Investigation
<Link
  to="/pricing"
  className="mt-2 flex w-full items-center justify-center gap-2 rounded border border-border bg-card px-4 py-2 text-sm transition-colors hover:bg-card/80"
>
  Pricing
</Link>
```

Keep Demo button behavior unchanged.

**Step 4: Run tests to verify pass**

Run: `npm run test:run -- src/features/sentra/__tests__/sidebar-pricing-link.test.tsx src/features/sentra/__tests__/sidebar-admin-demo-link.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/features/sentra/__tests__/sidebar-pricing-link.test.tsx src/features/sentra/components/Sidebar.tsx
git commit -m "feat: add pricing entry in app sidebar"
```

### Task 5: Verification Pass For New Flow

**Files:**
- Modify (if needed): `src/features/sentra/__tests__/routes-smoke.test.tsx`

**Step 1: Add/adjust smoke tests for direct pricing and checkout routes (optional if covered sufficiently by Task 1)**

```tsx
it('renders pricing route', () => {
  window.history.pushState({}, '', '/pricing');
  render(<App />);
  expect(screen.getByText(/paid plan/i)).toBeInTheDocument();
});
```

**Step 2: Run focused verification suite**

Run:
`npm run test:run -- src/features/sentra/__tests__/pricing-checkout-routes.test.tsx src/features/sentra/__tests__/landing-pricing-link.test.tsx src/features/sentra/__tests__/sidebar-pricing-link.test.tsx src/features/sentra/__tests__/routes-smoke.test.tsx src/features/sentra/__tests__/sidebar-admin-demo-link.test.tsx`

Expected: PASS for this focused suite.

**Step 3: Commit (only if files changed in this task)**

```bash
git add src/features/sentra/__tests__/routes-smoke.test.tsx
git commit -m "test: add smoke coverage for pricing routes"
```

If no additional file changes are needed, skip commit for this task.

---

## Notes For Execution

- Existing unrelated test failures in the broader suite are already known; do not gate this feature on full-suite green.
- Keep copy explicit that checkout is placeholder-only and non-charging.
- Do not introduce backend changes or payment SDK code in this phase.
