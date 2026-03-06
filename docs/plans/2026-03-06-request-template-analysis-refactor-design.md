# Request Template Analysis Refactor Design

**Date:** 2026-03-06  
**Status:** Approved for implementation

## Problem

Request-created jobs currently open a generic analysis document that does not strictly follow the report structure defined in `target_forms/Analysis PDF Template.md`.

The requirement is to redesign request analysis output only:
1. Keep chat analysis behavior unchanged.
2. Keep interactive web rendering style.
3. Enforce strict 1:1 section coverage and order from the template.
4. Derive metrics from inflowing actor data and persisted pipeline outputs, not placeholders.

## Goals

1. Deliver a request-only report contract aligned to template sections/subsections in exact order.
2. Keep chat/report paths backward compatible.
3. Compute metrics deterministically from persisted post/comment/sentiment/topic/stance/emotion/time data.
4. Preserve existing request route separation (`/request-history/...`) and job pipeline sharing.

## Non-Goals

1. Replacing chat analysis renderer.
2. Merging request and chat analysis contracts.
3. Switching to static PDF rendering.
4. Broad pipeline source expansion beyond current Facebook/Apify path in this iteration.

## Confirmed Requirements

1. Scope is request flow only.
2. Section set and order must be strict 1:1 with template.
3. UI remains interactive web format (cards/charts/tables).
4. Missing metrics should be computed from inflow-derived signals where feasible.

## Approaches Considered

### 1. Request-only backend template materializer (Selected)

Create a dedicated request analysis contract and backend materializer; render through a request-specific frontend component.

Pros:
1. Strong contract control and deterministic outputs.
2. Zero chat regression risk.
3. Clear testability and versioning.

Cons:
1. Additional backend + frontend contract surface.

### 2. Frontend-only remap of existing shared payload

Pros:
1. Faster implementation.

Cons:
1. Formula duplication in UI.
2. Weaker metric governance and auditing.

### 3. Full storage expansion first

Pros:
1. Maximum long-term fidelity.

Cons:
1. Largest scope and migration overhead.

## Selected Architecture

### API Surface

Add request-only route:
- `GET /v1/form-requests/{request_id}/analysis-document`

Behavior:
1. Owner-scope request lookup.
2. Resolve linked `job_id`.
3. Build and return strict template-shaped analysis payload.

Keep existing chat route unchanged:
- `GET /v1/jobs/{jobId}/analysis-document`

### Backend Components

1. Add request template materializer service, e.g. `request_analysis_template_materializer.py`.
2. Use persisted inflow-derived entities and analytics outputs as inputs.
3. Emit versioned contract metadata, e.g.:
- `report_contract: request_template_v1`
- `generated_from: inflow_derived`

### Frontend Components

1. Add request-specific interactive renderer, e.g. `RequestTemplateAnalysisDocument`.
2. Bind renderer only to request analysis route.
3. Keep existing chat `AnalysisResultsDocument` untouched.

## Data Derivation Model

Derived primitives:
1. Volume: post count, comment count, total mentions.
2. Engagement: total engagement, avg/post, engagement slices by stance/topic/actor.
3. Distributions: sentiment/emotion/stance counts and percentages.
4. Time-series: daily volume and engagement from timestamps.
5. Topic: topic share, sentiment bias, engagement share.
6. Influencer: actor concentration and top actor ranking.
7. Evidence: representative and outlier quotes from persisted sentiment rows.

For template fields lacking exact raw values (for example, shares if not explicitly persisted), compute deterministic modeled estimates from available inflow and include data-quality metadata.

## Strict Template Mapping (Request Flow)

Required output sections, exact order:
1. Cover Page
2. Executive Key Metrics Panel
3. Sentiment & Emotional Distribution
4. Stance Distribution Analysis (including its required sub-blocks)
5. Negative Reception Analysis
6. Topic Cluster Analysis
7. Engagement Decay Curve
8. Influencer Impact Analysis
9. Audience Behavior Insights
10. AI Strategic Insight Summary
11. Campaign Predictions
12. Strategic Conclusion

Rules:
1. All required sections always render.
2. Interactive components are allowed, but structure/order must stay template-aligned.
3. No chat-specific section contract leakage into request report rendering.

## Error Handling

1. Request without linked job: return request-state payload for loading UI.
2. Incomplete analytics: return partial-compute status while preserving full section shell.
3. Ownership violations: deny via existing auth/owner scope.
4. Render/API failure: request page keeps progress context and provides retry.

## Quality Rules

1. Numeric metrics use deterministic formulas, not freeform LLM generation.
2. Narrative text can use summary outputs, but should reference computed metrics.
3. Each section should include `data_quality` markers (coverage/confidence/sample size).

## Testing Strategy

### Backend

1. Unit tests for metric derivation helpers (volatility, stance ratios, concentration, decay, backlash heuristic).
2. Contract tests asserting strict section keys/order for request report endpoint.
3. Owner-scope and missing-job tests.

### Frontend

1. Request analysis route + renderer tests.
2. Strict section order rendering assertions.
3. Regression tests proving chat analysis renderer remains unchanged.

### Integration

1. Form request creation -> job completion -> request template report availability.
2. Verify request pipeline stages/progress remain visible while analysis builds.

## Risks and Mitigations

1. Risk: inferred metrics may overstate precision.
- Mitigation: expose data-quality confidence and define conservative formulas.

2. Risk: contract drift between backend and request UI.
- Mitigation: typed shared contract and snapshot tests.

3. Risk: accidental chat regression.
- Mitigation: route/component isolation and dedicated chat regression tests.

## Success Criteria

1. Request analysis page shows all template sections in exact order.
2. Metrics are computed from inflow-derived persisted data.
3. Chat analysis experience is unchanged.
4. Request route no longer redirects users to chat for report consumption.
