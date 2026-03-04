# Analysis Results Overflow and Vertical Strategic Layout Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Constrain long analysis text inside cards with consistent read-more toggles and render Strategic Insight summary/opportunities/risks vertically.

**Architecture:** Keep backend/API contracts unchanged and implement a UI-only enhancement in `AnalysisResultsDocument`. Introduce reusable collapsible text/list helpers, apply them across long-text renderers, and switch strategic insight layout from large-screen horizontal grid to vertical stack. Validate via focused frontend tests.

**Tech Stack:** React, TypeScript, TailwindCSS, Vitest, Testing Library

---

### Task 1: Add failing test for long strategic summary collapse

**Files:**
- Modify: `src/features/sentra/__tests__/analysis-results-document-backend.test.tsx`
- Modify: `src/features/sentra/components/AnalysisResultsDocument.tsx`

**Step 1: Write the failing test**

```tsx
it('collapses long strategic summary and expands on read more', async () => {
  // mock payload with ai_strategic_insight_summary.summary containing END-MARKER
  // assert marker is hidden initially
  // click Read more
  // assert marker is visible and Read less is present
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/features/sentra/__tests__/analysis-results-document-backend.test.tsx -t "collapses long strategic summary"`
Expected: FAIL because summary currently renders fully without collapse control.

**Step 3: Write minimal implementation**

```tsx
// Add reusable CollapsibleText component in AnalysisResultsDocument.tsx
// Use character threshold + local expanded state + Read more/Read less controls
// Replace summary paragraph render in renderStrategicInsight with CollapsibleText
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/features/sentra/__tests__/analysis-results-document-backend.test.tsx -t "collapses long strategic summary"`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/sentra/components/AnalysisResultsDocument.tsx src/features/sentra/__tests__/analysis-results-document-backend.test.tsx
git commit -m "feat: collapse long strategic summary content"
```

### Task 2: Add failing test for long opportunity/risk list item collapse

**Files:**
- Modify: `src/features/sentra/__tests__/analysis-results-document-backend.test.tsx`
- Modify: `src/features/sentra/components/AnalysisResultsDocument.tsx`

**Step 1: Write the failing test**

```tsx
it('collapses long strategic opportunities and risks list items', async () => {
  // mock payload with long top_opportunities/top_risks entries and END-MARKER strings
  // assert markers hidden initially
  // expand item with Read more
  // assert marker appears
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/features/sentra/__tests__/analysis-results-document-backend.test.tsx -t "opportunities and risks list items"`
Expected: FAIL because list items currently render full text.

**Step 3: Write minimal implementation**

```tsx
// Add CollapsibleList helper for string arrays
// Render long list items via CollapsibleText and keep empty-state behavior
// Apply in renderStrategicInsight and other long string-list sections
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/features/sentra/__tests__/analysis-results-document-backend.test.tsx -t "opportunities and risks list items"`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/sentra/components/AnalysisResultsDocument.tsx src/features/sentra/__tests__/analysis-results-document-backend.test.tsx
git commit -m "feat: collapse long strategic list items"
```

### Task 3: Add failing test for vertical strategic layout

**Files:**
- Modify: `src/features/sentra/__tests__/analysis-results-document-backend.test.tsx`
- Modify: `src/features/sentra/components/AnalysisResultsDocument.tsx`

**Step 1: Write the failing test**

```tsx
it('renders strategic summary, opportunities, and risks in vertical layout', async () => {
  // assert strategic wrapper does not contain lg:grid-cols-3
  // assert Summary card appears before Top Opportunities and Top Risks
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/features/sentra/__tests__/analysis-results-document-backend.test.tsx -t "vertical layout"`
Expected: FAIL because current layout uses `lg:grid-cols-3`.

**Step 3: Write minimal implementation**

```tsx
// In renderStrategicInsight, replace grid-based horizontal classes
// Use vertical stack classes (single-column / space-y)
// Preserve existing visual card wrappers and section titles
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/features/sentra/__tests__/analysis-results-document-backend.test.tsx -t "vertical layout"`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/sentra/components/AnalysisResultsDocument.tsx src/features/sentra/__tests__/analysis-results-document-backend.test.tsx
git commit -m "feat: stack strategic insight cards vertically"
```

### Task 4: Add overflow-safe wrapping across long text containers

**Files:**
- Modify: `src/features/sentra/components/AnalysisResultsDocument.tsx`
- Modify: `src/features/sentra/__tests__/analysis-results-document-backend.test.tsx`

**Step 1: Write the failing test**

```tsx
it('applies overflow-safe classes to long-text analysis content containers', async () => {
  // render payload with very long token
  // assert relevant nodes include break-words / overflow-hidden utility classes
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/features/sentra/__tests__/analysis-results-document-backend.test.tsx -t "overflow-safe classes"`
Expected: FAIL due to missing utility classes.

**Step 3: Write minimal implementation**

```tsx
// Add `break-words` and where needed `overflow-hidden` to text/list containers
// Ensure controls and metadata rows still align correctly
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/features/sentra/__tests__/analysis-results-document-backend.test.tsx -t "overflow-safe classes"`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/sentra/components/AnalysisResultsDocument.tsx src/features/sentra/__tests__/analysis-results-document-backend.test.tsx
git commit -m "fix: keep long analysis text within card bounds"
```

### Task 5: Regression and polish pass

**Files:**
- Modify: `src/features/sentra/components/AnalysisResultsDocument.tsx`
- Modify: `src/features/sentra/__tests__/analysis-results-document-backend.test.tsx`

**Step 1: Run focused suite**

Run: `npm run test -- src/features/sentra/__tests__/analysis-results-document-backend.test.tsx`
Expected: PASS for existing and new scenarios.

**Step 2: Run related document tests**

Run: `npm run test -- src/features/sentra/__tests__/intelligence-brief-backend.test.tsx`
Expected: PASS and no regressions in nearby rendering contracts.

**Step 3: Make minimal fixes if needed**

```tsx
// adjust helper reuse, keys, and class names without widening scope
```

**Step 4: Re-run tests**

Run:
- `npm run test -- src/features/sentra/__tests__/analysis-results-document-backend.test.tsx`
- `npm run test -- src/features/sentra/__tests__/intelligence-brief-backend.test.tsx`
Expected: PASS

**Step 5: Final commit**

```bash
git add src/features/sentra/components/AnalysisResultsDocument.tsx src/features/sentra/__tests__/analysis-results-document-backend.test.tsx
git commit -m "feat: constrain analysis text and add reusable read-more behavior"
```

### Task 6: Documentation sync

**Files:**
- Modify: `docs/plans/2026-03-04-analysis-results-overflow-and-vertical-strategic-layout-design.md`
- Modify: `docs/plans/2026-03-04-analysis-results-overflow-and-vertical-strategic-layout-implementation-plan.md`

**Step 1: Update notes with actual implementation details**

```md
- Record final helper names, thresholds, and exact tested behaviors.
```

**Step 2: Verify docs diff clarity**

Run: `git diff -- docs/plans/2026-03-04-analysis-results-overflow-and-vertical-strategic-layout-design.md docs/plans/2026-03-04-analysis-results-overflow-and-vertical-strategic-layout-implementation-plan.md`
Expected: concise and accurate record.

**Step 3: Commit docs updates**

```bash
git add docs/plans/2026-03-04-analysis-results-overflow-and-vertical-strategic-layout-design.md docs/plans/2026-03-04-analysis-results-overflow-and-vertical-strategic-layout-implementation-plan.md
git commit -m "docs: finalize analysis-results overflow implementation notes"
```
