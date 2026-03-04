# Payments Placeholder Design

Date: 2026-03-04
Status: Approved
Branch: feat/payments-placeholder-page
Worktree: /home/ika/repos/sentra-v2/sentra-frontend/.worktrees/payments-placeholder-page

## 1. Goal

Introduce a payments placeholder flow that can ship immediately without Dodo integration:

- Public pricing route: `/pricing`
- Public mock checkout route: `/checkout`
- Entry points from both landing and app sidebar
- Single plan only: `Paid Plan` at `$20/mo`
- No free trial language
- No real payment processing

## 2. Scope

### In scope

- Add pricing page with one paid plan card
- Add checkout placeholder page with mock order summary
- Add route wiring for `/pricing` and `/checkout`
- Add landing header navigation link to pricing
- Add sidebar action to pricing
- Add minimal route/UI tests for new flow

### Out of scope

- Dodo SDK integration
- Backend billing APIs/webhooks
- Subscription entitlement logic
- Database schema changes

## 3. Approaches Considered

### A. Standalone route pages (selected)

Create dedicated components for `/pricing` and `/checkout` and wire them in app routes.

Why selected:

- Fastest implementation with lowest regression risk
- Avoids invasive edits in `AppShell` chat flow logic
- Clear path to replace placeholders with real integration later

### B. AppShell-integrated pricing mode

Render pricing/checkout as additional `AppShell` modes.

Tradeoff:

- Centralized logic but higher coupling and risk in a complex component

### C. Reuse landing with conditional sections

Use one page and switch sections by path/query.

Tradeoff:

- Fewer files but weaker separation and maintainability

## 4. UX and Content

## 4.1 `/pricing`

- One plan card:
  - Plan name: `Paid Plan`
  - Price: `$20/mo`
  - Placeholder features (4-6 bullets)
  - CTA: `Continue to Checkout`
- Clear note that checkout is placeholder and not charging users

## 4.2 `/checkout`

- Mock order summary:
  - Plan: `Paid Plan`
  - Price: `$20/mo`
  - Total: `$20`
- Placeholder payment section (non-functional)
- Primary action: back to pricing
- Optional secondary action: contact sales

## 4.3 Entry points

- Landing header includes `Pricing`
- In-app sidebar includes `Pricing`
- Both navigate to `/pricing`

## 5. Architecture

- Frontend-only change
- Add two new page components under existing frontend structure
- Route additions in `src/App.tsx`
- Light, isolated wiring in `LandingPage` and `Sidebar` components
- No backend changes

## 6. Data Flow

1. User opens `/pricing` from landing header or sidebar
2. User clicks `Continue to Checkout`
3. Frontend navigates to `/checkout`
4. User sees placeholder summary and non-functional payment area

No API requests are introduced in this phase.

## 7. Error Handling

- Use existing route fallback (`NotFound`) for unknown paths
- Keep placeholder text explicit to avoid confusion about real charging
- No async error paths introduced

## 8. Testing Strategy

Minimal targeted test coverage:

- Route rendering for `/pricing` and `/checkout`
- Pricing page shows `Paid Plan` and `$20/mo`
- CTA navigation from `/pricing` to `/checkout`
- Landing header `Pricing` link navigates correctly
- Sidebar `Pricing` action navigates correctly

## 9. Risks and Mitigations

- Risk: user confusion with non-functional checkout
  - Mitigation: explicit “placeholder/no real charge” copy on both pages
- Risk: routing regressions in existing app flow
  - Mitigation: isolated route additions + focused tests

## 10. Rollout and Next Phase

This is a placeholder release only.
Next phase will replace mock checkout with Dodo-backed session creation, webhook handling, and entitlement updates.
