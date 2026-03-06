# Navigation Redesign — Top Navbar

## Summary

Replace the sidebar-based navigation with a top navbar. Make request forms the primary pipeline. Hide chat (keep code, remove routing). All authenticated pages navigable from everywhere.

## Top Navbar

- **Left:** Logo/brand → "Request History" link → "Pricing" link → "Admin" link (admin-only)
- **Right:** "New Request" CTA button → User menu (logout)
- Sticky top, rendered on all authenticated pages

## Routing

| Route | Page | Notes |
|---|---|---|
| `/` | Redirect | → `/request-history` if authenticated, landing if not |
| `/request-form` | Request form | Primary action |
| `/request-history` | Request history list | Primary hub |
| `/request-history/:id` | Request detail | |
| `/request-history/:id/analysis` | Request analysis | |
| `/pricing` | Pricing | |
| `/checkout` | Checkout placeholder | |
| `/admin/demo` | Admin demo | Admin-only |
| `/admin/users/usage` | Admin usage list | Admin-only |
| `/admin/users/usage/:userId` | Admin usage detail | Admin-only |
| `/chat` | **REMOVED** | Code kept, route removed |

## Layout

- New shared `AppLayout` component: top navbar + full-width content area
- All authenticated pages render inside `AppLayout`
- Landing page and auth pages unchanged (no navbar)

## What Gets Removed (from active use)

- Sidebar rendering on active routes (component code kept)
- `/chat` route from router
- "New Investigation" button and chat-related nav
- AppShell's chat-centric view switching for active routes
