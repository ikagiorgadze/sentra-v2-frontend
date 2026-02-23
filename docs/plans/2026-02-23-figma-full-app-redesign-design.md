# Figma-Source-of-Truth Full-App Redesign (Desktop-First)

## Context
The existing frontend in `sentra-frontend` is similar to the target, but the Figma Make file is the source of truth for both visuals and behavior.

- Figma link: `https://www.figma.com/make/SkVcyYQp58pktS7HcNfA0n/Sentra-GenAI-Interface-Design?t=akA9sUcQjtZvwWYQ-6`
- Scope: entire app
- Fidelity target: pixel-accurate
- Validation order: desktop first, then broader responsive coverage

## Decisions Confirmed

1. Use route-by-route replacement (recommended approach) while preserving useful project infrastructure.
2. Keep existing implementation as migration base (do not rewrite from zero).
3. Figma is authoritative for all behavior and flow differences.
4. “Done” means exact desktop parity first; cross-browser correctness still required.

## Architecture

Keep the existing React/Vite project infrastructure and rebuild the UX to match Figma.

- Reuse:
  - Build/tooling setup
  - Existing repository structure
  - Supabase/client integration primitives where still needed
- Replace from Figma:
  - Page/component structure
  - Interaction behavior and flow
  - Styling tokens, typography, spacing, borders, radii, and motion
- Migration strategy:
  - Implement route/page replacements incrementally
  - Remove or reroute legacy UI once Figma-equivalent behavior is in place

## Component and Page Structure

Based on Figma Make source, target structure is:

- `AppShell` with top-level views:
  - `landing`
  - `auth`
  - `app`
- Landing:
  - `LandingPage` (hero, personas, process, feature grid, CTA, footer)
- Auth:
  - `AuthPage` (single screen with login/signup toggle)
- Main app workspace:
  - `Sidebar` (new investigation + recent investigation history)
  - Center content area:
    - `QueryInput` (query field, filters, sample prompts)
    - `RunningState` (progress counters while processing)
    - `IntelligenceBrief` (summary, charts, narratives, risk signals, evidence, follow-up actions)
  - `RightPanel` (collapsible advanced filters + methodology)
- Theme and tokens:
  - Align to Figma palette and token behavior (charcoal/graphite/cyan/amber plus tokenized borders/radii/type)

## Data Flow and Behavior

### State model
- `currentView`: `landing | auth | app`
- `appState`: `idle | running | results`

### Primary flow
1. Landing `Get Started` transitions to auth.
2. Auth success transitions to app workspace.
3. Query submit transitions `idle -> running`.
4. Processing completion transitions `running -> results`.
5. “New Investigation” resets to `idle` and clears current selection.

### Investigation history
- Each completed query creates a history item with:
  - `id`, `title`, `timestamp`, `domain`, `query`
- Selecting history restores that query and shows results state.
- Relative timestamps refresh periodically.

### Panels
- Left sidebar always visible in app workspace.
- Right panel collapsed by default; expands/collapses with transition.

### Routing implications
- Existing multi-page route map may be consolidated/rerouted to Figma flow.
- React Router remains only where needed for app entry and compatibility.

## Error Handling

- Guard invalid transitions (for example, empty query should not enter running state).
- Ensure each state/view has deterministic fallback UI.
- Isolate non-Figma legacy integrations so they do not break primary rendering path during migration.

## Testing and Validation

### Pixel-accuracy validation (desktop first)
- Validate against one canonical desktop reference viewport before responsive expansion.
- Check:
  - Typography scale and weights
  - Spacing and alignment
  - Colors and contrast
  - Borders/radii/shadows
  - Motion timings and transition feel

### Functional tests
- View transitions: `landing -> auth -> app`
- Query lifecycle: `idle -> running -> results`
- Investigation history add/select/reset behavior
- Right panel collapse/expand behavior

### Regression checks
- Build + lint pass
- Route smoke checks for reachable entry points
- Remove or deprecate dead/unreachable legacy pages once migration completes

## Non-Goals for This Phase

- Mobile/tablet pixel-perfection in the same step as desktop lock
- Introducing new product behavior not present in Figma

## Implementation Handoff

Next step is to create a concrete execution plan (tasks, order, checkpoints, test gates) using the `writing-plans` skill.
