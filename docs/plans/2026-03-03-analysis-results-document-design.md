# Analysis Results Document Redesign (In-Chat, Full Sections, Real Data)

## Context

The current analysis result view is rendered by `IntelligenceBrief` in chat. It currently shows a shorter brief (summary, selected charts, risk, evidence, actions).  
The new requirement is to replace this with a full analysis document, while keeping the same in-chat placement and current visual language.

Figma reference source:

- Make file key: `wP8CEDakxlYsQlxYUNz68F`
- Reference title inside design: `Campaign Intelligence Dossier`
- Important naming decision: this is **reference content scope only**. The product surface is the new **Analysis Results Document**, not a separate "dossier" feature.

## Approved Decisions

1. Keep results embedded in chat (no separate report page).
2. Replace the old brief with the new full document structure.
3. Include full reference section coverage (13 sections).
4. All sections must be populated from real backend data or deterministic backend derivations.
5. Sentiment model changes to support both:
   - `stance` (primary): `strongly_support`, `support`, `neutral`, `oppose`, `strongly_oppose`
   - `emotion` (secondary): `supportive`, `curious`, `neutral`, `critical`, `concerned`, `dismissive`, `angry`, `humorous`, `hopeful`
6. Do not implement backfill/migration behavior for old jobs in this scope.
7. No dual-mode rendering (legacy + new). New document is the canonical results rendering path.

## Architecture

### Frontend

- Replace current `IntelligenceBrief` rendering path with a new `AnalysisResultsDocument` rendering path inside the existing `assistant_brief` chat bubble flow.
- Keep overall design tokens, card style, typography rhythm, and chart style aligned with existing Sentra UI (no stylistic redesign).
- Break document rendering into section-level components for maintainability and isolated testability.

### Backend

- Add a single canonical read endpoint:
  - `GET /v1/jobs/{jobId}/analysis-document`
- Endpoint returns fully computed section payloads (not raw-only data requiring heavy client recomputation).
- Update analysis pipeline to generate new stance/emotion labels and all required section aggregates/derived metrics for supported jobs.

### Contract Naming

- Use `analysis-document` naming in API and frontend code.
- Avoid `dossier` naming in product-facing and internal implementation names.

## Document Section Coverage (Required)

The new Analysis Results Document must include these sections, mapped from the Figma reference:

1. Cover
2. Executive Key Metrics
3. Sentiment & Emotional Distribution
4. Stance Distribution Analysis
5. Stance Drivers
6. Negative Reception Analysis
7. Topic Cluster Analysis
8. Engagement Decay Curve
9. Influencer Impact Analysis
10. Audience Behavior Insights
11. AI Strategic Insight Summary
12. Campaign Predictions
13. Strategic Conclusion

## Data and Derivation Rules

1. Backend is source of truth for all business metrics and classifications.
2. Frontend is responsible for presentation/formatting only.
3. Each section must return a stable, explicit schema (including deterministic defaults for low/empty data).
4. Section containers remain present even when data is limited; show explicit `data unavailable` placeholders per field/row where needed.

## Data Flow

1. User opens/lands on a completed job in chat.
2. Chat bubble requests `GET /v1/jobs/{jobId}/analysis-document`.
3. Frontend renders full document in-chat from the returned payload.
4. No enrichment polling/status workflow in this scope.
5. Historical jobs without required new outputs are out of scope for this change.

## Error Handling

1. If `GET /analysis-document` fails, render an inline error state in the chat bubble.
2. Inline error includes retry action.
3. Avoid replacing with generic toast-only failures.
4. Preserve chat history rendering even when a single document load fails.

## Testing Strategy

### Backend

1. Unit tests for stance/emotion classification mapping.
2. Unit tests for section aggregate computations and index/ratio formulas.
3. API contract tests for `GET /analysis-document` with:
   - representative populated dataset
   - minimal/empty dataset defaults

### Frontend

1. Component tests for full section rendering coverage.
2. Tests for chart/table rendering against real payload shapes.
3. Tests for inline error + retry behavior.
4. Integration tests ensuring assistant brief bubbles render the new document path (and old brief path is removed from results behavior).

## Non-Goals

1. Backfilling all old jobs to the new schema.
2. Building a separate report page outside chat.
3. Redesigning global app visual style.

## Implementation Handoff

Next step: create a detailed implementation plan via the `writing-plans` skill with TDD-first, small tasks, exact file paths, and commit checkpoints.
