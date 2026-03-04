# Analysis Results Overflow + Vertical Strategic Layout Design

**Date:** 2026-03-04
**Scope:** `AnalysisResultsDocument` rendering behavior for long text and strategic insight layout

## Problem Statement

Analysis result content can be long enough to overwhelm cards and reduce readability. The current document has partial truncation behavior (representative quotes only), while other long text fields can render at full length. In addition, the Strategic Insight section (`Summary`, `Top Opportunities`, `Top Risks`) currently renders horizontally at large breakpoints, which makes scanning less effective for long narratives.

## Goals

1. Keep all analysis content contained within visual card boundaries.
2. Add consistent `Read more` / `Read less` behavior for long text fields across the analysis document.
3. Render Strategic Insight blocks vertically instead of horizontally.
4. Preserve existing API contracts and section payload normalization.

## Non-Goals

1. Redesign the visual theme or typography system.
2. Change backend response shape or analytics generation.
3. Add nested scrolling containers as the primary long-content strategy.

## Chosen Approach

Use a minimal, consistent truncation strategy based on character thresholds across all long text fields:

1. Reuse and generalize the existing collapse logic currently used in quote examples.
2. Introduce reusable UI helpers for collapsible paragraph text and collapsible string-list items.
3. Apply defensive wrapping classes (`break-words`, `overflow-hidden`) where long tokens might otherwise overflow card boundaries.
4. Change Strategic Insight layout from horizontal 3-column grid (`lg:grid-cols-3`) to a vertical stack.

This is the lowest-risk approach because it aligns with existing behavior and avoids line-clamp edge cases.

## Alternatives Considered

### Option A: Line-clamp based truncation

- Pros: visually uniform block heights.
- Cons: line-clamp behavior can be fragile with mixed content and responsive breakpoints; more CSS complexity.

### Option B: Fixed-height cards with internal scroll

- Pros: simple truncation logic.
- Cons: nested scrolling harms readability and interaction quality for analysis documents.

## UX Behavior

1. Long textual fields render a preview with `Read more`.
2. Expanding reveals full text inline; control becomes `Read less`.
3. Control appears only if text exceeds threshold.
4. Strategic Insight renders in this vertical order:
   - Summary
   - Top Opportunities
   - Top Risks

## Affected Areas

- `src/features/sentra/components/AnalysisResultsDocument.tsx`
  - Add generalized collapse helpers.
  - Apply helpers to paragraph fields and string lists.
  - Convert strategic section layout to vertical stack.
  - Add container-safe wrapping to avoid overflow.
- `src/features/sentra/__tests__/analysis-results-document-backend.test.tsx`
  - Extend coverage for long-text collapse behavior beyond quote examples.
  - Add assertions for strategic vertical ordering and expansion controls.

## Error Handling / Loading

No behavioral changes to loading and error/retry states. Existing request lifecycle remains unchanged.

## Test Strategy

1. Verify long non-quote text is initially collapsed and expandable.
2. Verify long opportunities/risks list items collapse and expand as expected.
3. Verify strategic section uses vertical stack class and preserves card ordering.
4. Keep existing quote collapse test passing to ensure compatibility.

## Risks and Mitigations

1. **Risk:** Over-applying collapse may hide short content.
   - **Mitigation:** show toggle only when text length exceeds threshold.
2. **Risk:** Break-word styles may affect readability in normal text.
   - **Mitigation:** apply only at card/text containers that can overflow.
3. **Risk:** Shared collapse helpers can introduce state bugs.
   - **Mitigation:** use per-item keyed local state and explicit tests for toggle behavior.

## Success Criteria

1. Long text no longer overflows card boundaries.
2. Strategic insight cards are vertically stacked across breakpoints.
3. Users can expand/collapse long content anywhere in the analysis document where applicable.
4. Updated tests pass for new behavior and existing regressions.
