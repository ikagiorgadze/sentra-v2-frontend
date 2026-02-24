# Chat Typing Indicator Logo Design

Date: 2026-02-24
Repo: sentra-frontend
Status: Approved

## Context
The chat typing indicator currently shows text (`Sentra is thinking...`) with a small placeholder-like rounded rectangle where branding should be visible. The project already has a canonical logo asset used as the browser tab icon.

Relevant existing assets:
- `public/favicon.svg`
- `public/favicon.png`
- `public/favicon.ico`

Relevant UI component:
- `src/features/sentra/components/chat/ConversationPanel.tsx`

## Goal
Use the actual Sentra logo (tab logo) in the chat typing indicator so users clearly see that Sentra is generating a response.

## Chosen Approach
Use `public/favicon.svg` directly in the typing indicator bubble.

Why this approach:
- Reuses the canonical brand source already used for browser icon.
- Smallest change surface and no new asset management.
- Keeps behavior deterministic and easy to maintain.

## Scope
In scope:
- Typing indicator UI only (`showAssistantTyping` block).
- Add logo icon and keep existing text (`Sentra is thinking...`).

Out of scope:
- Adding avatar/logo to every assistant message bubble.
- Any logic changes to streaming, message lifecycle, or backend.

## UI Specification
Typing indicator row should render as:
- Left: logo image sourced from `/favicon.svg`.
- Right: text `Sentra is thinking...`.

Layout constraints:
- Use compact horizontal alignment (`inline-flex`, `items-center`, `gap-2`).
- Keep icon size subtle (approx `h-4 w-4`) to match current UI density.
- Preserve existing typing bubble styling and color palette.

Accessibility:
- Provide `alt="Sentra logo"` on the image.

## Risks and Mitigation
Risk level: low.

Potential risks:
- Minor vertical misalignment in the bubble.
- Slight visual shift if icon sizing is not constrained.

Mitigation:
- Explicit icon dimensions in utility classes.
- Keep existing wrapper/bubble classes unchanged.

## Validation
- Manual: While waiting for assistant response, typing bubble displays Sentra logo + text.
- Regression: Run existing frontend chat tests (streaming and confirmation suites) to ensure no behavioral regressions.

## Rollback
Single-file rollback in:
- `src/features/sentra/components/chat/ConversationPanel.tsx`
