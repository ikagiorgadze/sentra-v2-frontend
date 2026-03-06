# Form Request Flow And Separate History Design

**Date:** 2026-03-06  
**Status:** Approved for implementation

## Problem

Current job creation is chat-driven (`/chat`) with proposal confirmation in the conversation timeline. The new requirement is to support a non-chat, form-first intake flow while keeping existing chat behavior intact.

At the same time, analysis output requirements were updated in `target_forms/Analysis PDF Template.md`, and form-originated requests must have separate history from chat history.

## Goals

1. Add a dedicated form-based request creation flow under separate URL(s).
2. Keep `/chat` behavior unchanged (including chat-specific cost and interaction logic).
3. Converge both creation paths into the same existing job pipeline and analysis document rendering after job creation.
4. Keep history domains separate:
   - Chat history for chat-originated conversations/jobs.
   - Request history for form-originated requests/jobs.
5. Align rendered analysis document coverage with the updated report template.

## Non-Goals

1. Replacing or refactoring existing chat confirmation workflow.
2. Building a second analysis renderer for form requests.
3. Merging chat and form history into one list.
4. Redesigning global app shell visuals.

## Requirements Confirmed In Brainstorming

1. Form route is separate from chat route.
2. Job pipeline after creation remains shared.
3. Form submit includes a frontend-generated query string plus structured fields.
4. Form requests use separate history from chat.

## Approaches Considered

### 1. New First-Class Form Requests Domain (Selected)

- Add dedicated backend entity/endpoints for form requests.
- Add dedicated frontend routes/pages for request creation/history/detail.
- Persist structured payload and generated query, then create job through existing orchestration.

Pros:
1. Clean separation of concerns.
2. Clear audit trail for enterprise form fields.
3. Future-safe for request-specific analytics/policies.

Cons:
1. More initial implementation work.

### 2. Frontend-Only Separation, Backend Reuses Existing Entities

Pros:
1. Faster initial delivery.

Cons:
1. Weak separation for history/reporting.
2. Harder long-term maintenance and filtering.

### 3. Conversation Reuse With "Form Mode"

Pros:
1. Minimal schema change.

Cons:
1. Violates separate-history intent.
2. Couples unrelated interaction models.

## Selected Architecture

### Product Routes

1. Keep `/chat` as-is for conversational workflow.
2. Add `/request-form` for structured intake.
3. Add `/request-history` for form request listing.
4. Add `/request-history/:requestId` for request detail + linked job status/report.

### Shared Runtime Path

1. `/request-form` submission persists a form request record.
2. Submission also creates/enqueues a normal job using existing pipeline.
3. Results continue to render through existing analysis document mechanism.

### History Separation

1. Chat sidebar recent chats remain conversation-scoped.
2. Form requests are listed only in request history views.
3. No cross-population between the two history domains.

## Backend Design

### New API Surface

1. `POST /v1/form-requests`
- Input: validated structured form payload + generated `query`.
- Behavior: persist request, create/enqueue job, return request + job linkage.

2. `GET /v1/form-requests`
- Returns only form-originated requests for authenticated owner.

3. `GET /v1/form-requests/{request_id}`
- Returns full request payload snapshot, generated query, linked job metadata/status.

### Data Model

Add `form_requests` table (name tentative):
1. `id` (UUID)
2. `owner_user_id` (UUID)
3. `status` (`submitted|running|completed|failed`)
4. `query` (string)
5. `form_payload_json` (JSONB)
6. `normalization_json` (JSONB, optional)
7. `job_id` (UUID nullable until creation completes, then set)
8. `inserted_at`, `updated_at`

### Query Generation Contract

1. Frontend deterministically builds `query` preview from form fields.
2. Backend validates `query` non-empty and required fields consistency.
3. Backend never relies on chat LLM extraction for this path.

## Frontend Design

### New Components/Pages

1. `RequestFormPage` (sectioned form according to `SENTRA INTELLIGENCE REQUEST FORM.md`)
2. `RequestHistoryPage` (separate list/table)
3. `RequestDetailPage` (submitted payload, job progress, open report)

### Form Interaction

1. Required/optional field semantics explicit in UI.
2. Multi-value controls for keywords and competitors.
3. Checkbox/multi-select controls for objectives and deliverables.
4. Deterministic read-only query preview before submit.
5. Submit transitions to request detail page.

### Navigation

1. Add request-related entries in app navigation.
2. Keep existing recent chat list unchanged and isolated.

## Analysis Output Alignment

Keep single analysis document render path for all jobs, but align section coverage with updated template.

Required sections:
1. Cover
2. Executive Key Metrics
3. Sentiment & Emotional Distribution
4. Stance Distribution Analysis
5. Negative Reception Analysis
6. Topic Cluster Analysis
7. Engagement Decay Curve
8. Influencer Impact Analysis
9. Audience Behavior Insights
10. AI Strategic Insight Summary
11. Campaign Predictions
12. Strategic Conclusion

Notes:
1. Current renderer already covers most sections.
2. Influencer impact section is the notable missing section to add in shared renderer/contract.
3. Keep deterministic placeholders when section data is unavailable.

## Data Flow

1. User opens `/request-form` and completes fields.
2. Frontend derives `query` string and submits form payload + query.
3. Backend stores request and enqueues job.
4. User sees request detail/status in `/request-history/:requestId`.
5. On completion, analysis document is available through existing job/report pipeline.

## Error Handling

1. Form validation errors shown inline per field.
2. Submit/network/API errors shown on form page with retry.
3. Request detail view handles unavailable/deleted job gracefully.
4. Analysis document failures keep current inline retry behavior.

## Testing Strategy

### Backend

1. Schema validation tests for form request payload and query constraints.
2. API contract tests for create/list/detail endpoints with owner scope.
3. Integration tests ensuring form request creation enqueues standard job payload.

### Frontend

1. Form component tests for required fields, multi-value fields, and query preview.
2. Request history/detail tests for separate-list behavior.
3. Routing tests for `/request-form`, `/request-history`, `/request-history/:requestId`.
4. Regression tests confirming `/chat` flow remains unchanged.
5. Shared analysis document tests updated for new section coverage (especially influencer section).

## Risks And Mitigations

1. Risk: duplication between request status and job status.
- Mitigation: derive or synchronize request status from linked job transitions.

2. Risk: query preview quality mismatch with backend expectations.
- Mitigation: centralize deterministic query builder and test canonical samples.

3. Risk: accidental history mixing in UI.
- Mitigation: separate API calls/state slices/components for chat vs request history.

## Success Criteria

1. Users can create jobs via `/request-form` without chat.
2. `/chat` continues to work unchanged.
3. Form requests appear only in request history views.
4. Post-creation processing and report rendering are shared and consistent.
5. Analysis report structure matches updated template coverage.
