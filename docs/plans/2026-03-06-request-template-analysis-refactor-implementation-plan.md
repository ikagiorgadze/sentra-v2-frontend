# Request Template Analysis Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a request-only analysis document pipeline that renders an interactive web report in strict 1:1 section order/coverage with `target_forms/Analysis PDF Template.md`, while leaving chat analysis unchanged.

**Architecture:** Add a request-only backend endpoint under form requests that resolves the owner-scoped request and linked job, then materializes a template-ordered report from persisted inflow-derived analytics. Add a request-specific frontend renderer/page data flow for `/request-history/:requestId/analysis` that uses the new endpoint and enforces the template section order. Keep existing chat analysis endpoint and component untouched.

**Tech Stack:** FastAPI, SQLAlchemy async repositories, Pydantic, pytest, React, TypeScript, Vitest, Testing Library.

---

Execution notes:
- Use `@test-driven-development` and `@python-testing-patterns` on each backend task.
- Keep DRY/YAGNI: request-only contract layer, no chat contract rewiring.
- Commit after every task.
- Apify MCP actor introspection was unavailable in-session; derivations rely on current enforced actor contracts and persisted inflow fields already mapped by ingest.

### Task 1: Add Request Analysis Endpoint Contract Tests

**Files:**
- Modify: `tests/api/test_form_requests_api_contract.py`
- Modify: `tests/api/test_openapi_contract.py`

**Step 1: Write the failing tests**

```python
def test_form_requests_analysis_document_owner_scoped(monkeypatch) -> None:
    # stub form request lookup (with job_id) and analytics builder
    # GET /v1/form-requests/{id}/analysis-document returns 200 + strict section envelope
    ...


def test_form_requests_analysis_document_requires_linked_job(monkeypatch) -> None:
    # stub request record with job_id=None
    # endpoint returns 409 with deterministic message
    ...
```

**Step 2: Run test to verify it fails**

Run: `cd /home/ika/repos/sentra-v2/sentra-backend && uv run --extra dev pytest tests/api/test_form_requests_api_contract.py tests/api/test_openapi_contract.py -q`
Expected: FAIL because route `/v1/form-requests/{request_id}/analysis-document` does not exist.

**Step 3: Write minimal implementation stubs**

```python
# src/sentra_api/api/routes/form_requests.py
@router.get("/{request_id}/analysis-document")
async def get_form_request_analysis_document(...):
    raise HTTPException(status_code=501, detail="not_implemented")
```

**Step 4: Run test to verify failure shape moves forward**

Run: `cd /home/ika/repos/sentra-v2/sentra-backend && uv run --extra dev pytest tests/api/test_form_requests_api_contract.py -q`
Expected: FAIL transitions from 404 to 501/not-implemented.

**Step 5: Commit**

```bash
git -C /home/ika/repos/sentra-v2/sentra-backend add tests/api/test_form_requests_api_contract.py tests/api/test_openapi_contract.py src/sentra_api/api/routes/form_requests.py
git -C /home/ika/repos/sentra-v2/sentra-backend commit -m "test: add request analysis-document endpoint contract coverage"
```

### Task 2: Add Request Analysis Response Schemas

**Files:**
- Create: `src/sentra_api/schemas/request_analysis.py`
- Modify: `src/sentra_api/schemas/form_requests.py`
- Modify: `src/sentra_api/api/routes/form_requests.py`
- Test: `tests/unit/api/routes/test_form_requests_owner_scope.py`

**Step 1: Write the failing schema/route typing test**

```python
@pytest.mark.asyncio
async def test_form_request_analysis_route_returns_typed_response(monkeypatch):
    payload = await form_requests_routes.get_form_request_analysis_document(...)
    assert payload.meta.report_contract == "request_template_v1"
    assert payload.sections[0].key == "cover_page"
```

**Step 2: Run test to verify it fails**

Run: `cd /home/ika/repos/sentra-v2/sentra-backend && uv run --extra dev pytest tests/unit/api/routes/test_form_requests_owner_scope.py -q`
Expected: FAIL due to missing request analysis response models.

**Step 3: Write minimal schemas**

```python
# src/sentra_api/schemas/request_analysis.py
class RequestAnalysisMeta(BaseModel):
    request_id: str
    job_id: str
    report_contract: str = "request_template_v1"
    generated_at: str


class RequestAnalysisSection(BaseModel):
    key: str
    title: str
    payload: dict[str, Any] = Field(default_factory=dict)


class RequestAnalysisDocumentResponse(BaseModel):
    meta: RequestAnalysisMeta
    sections: list[RequestAnalysisSection] = Field(default_factory=list)
```

**Step 4: Run test to verify it passes**

Run: `cd /home/ika/repos/sentra-v2/sentra-backend && uv run --extra dev pytest tests/unit/api/routes/test_form_requests_owner_scope.py -q`
Expected: PASS for schema typing path.

**Step 5: Commit**

```bash
git -C /home/ika/repos/sentra-v2/sentra-backend add src/sentra_api/schemas/request_analysis.py src/sentra_api/schemas/form_requests.py src/sentra_api/api/routes/form_requests.py tests/unit/api/routes/test_form_requests_owner_scope.py
git -C /home/ika/repos/sentra-v2/sentra-backend commit -m "feat: add typed request analysis document schema contract"
```

### Task 3: Add Deterministic Request Template Metric Helpers

**Files:**
- Create: `src/sentra_api/services/analysis/request_template_metrics.py`
- Create: `tests/unit/services/analysis/test_request_template_metrics.py`

**Step 1: Write failing unit tests for formulas**

```python
def test_support_vs_opposition_ratio_is_stable():
    ratio = support_opposition_ratio(support=30, opposition=10)
    assert ratio == "3:1"


def test_volatility_sensitivity_uses_timeseries_delta():
    score = volatility_sensitivity([10, 30, 20, 50])
    assert score > 0


def test_backlash_probability_tier_uses_negative_trajectory_and_opposition_share():
    tier = backlash_probability_tier(negative_share=0.42, opposition_share=0.37, volatility=0.6)
    assert tier in {"High", "Medium", "Low"}
```

**Step 2: Run test to verify it fails**

Run: `cd /home/ika/repos/sentra-v2/sentra-backend && uv run --extra dev pytest tests/unit/services/analysis/test_request_template_metrics.py -q`
Expected: FAIL because helper module does not exist.

**Step 3: Write minimal helper implementations**

```python
def support_opposition_ratio(*, support: int, opposition: int) -> str:
    if opposition <= 0:
        return f"{max(support, 0)}:0"
    return f"{round(max(support, 0) / opposition, 2)}:1"


def volatility_sensitivity(points: list[float]) -> float:
    if len(points) < 2:
        return 0.0
    deltas = [abs(points[i] - points[i - 1]) for i in range(1, len(points))]
    baseline = max(sum(points) / len(points), 1.0)
    return round(min(1.0, (sum(deltas) / len(deltas)) / baseline), 4)


def backlash_probability_tier(*, negative_share: float, opposition_share: float, volatility: float) -> str:
    score = (negative_share * 0.45) + (opposition_share * 0.35) + (volatility * 0.20)
    if score >= 0.6:
        return "High"
    if score >= 0.35:
        return "Medium"
    return "Low"
```

**Step 4: Run test to verify it passes**

Run: `cd /home/ika/repos/sentra-v2/sentra-backend && uv run --extra dev pytest tests/unit/services/analysis/test_request_template_metrics.py -q`
Expected: PASS.

**Step 5: Commit**

```bash
git -C /home/ika/repos/sentra-v2/sentra-backend add src/sentra_api/services/analysis/request_template_metrics.py tests/unit/services/analysis/test_request_template_metrics.py
git -C /home/ika/repos/sentra-v2/sentra-backend commit -m "feat: add deterministic request template metric helpers"
```

### Task 4: Build Request Template Materializer (Strict 1:1 Sections)

**Files:**
- Create: `src/sentra_api/services/analysis/request_template_materializer.py`
- Create: `tests/unit/services/analysis/test_request_template_materializer.py`

**Step 1: Write failing section-order contract tests**

```python
def test_materializer_emits_strict_template_order():
    payload = materialize_request_template_document(...)
    assert [s["key"] for s in payload["sections"]] == [
        "cover_page",
        "executive_key_metrics_panel",
        "sentiment_emotional_distribution",
        "stance_distribution_analysis",
        "negative_reception_analysis",
        "topic_cluster_analysis",
        "engagement_decay_curve",
        "influencer_impact_analysis",
        "audience_behavior_insights",
        "ai_strategic_insight_summary",
        "campaign_predictions",
        "strategic_conclusion",
    ]
```

**Step 2: Run test to verify it fails**

Run: `cd /home/ika/repos/sentra-v2/sentra-backend && uv run --extra dev pytest tests/unit/services/analysis/test_request_template_materializer.py -q`
Expected: FAIL because materializer does not exist.

**Step 3: Write minimal materializer with strict section keys/order**

```python
def materialize_request_template_document(*, request_id: str, job_id: str, primary_entity: str, ...):
    return {
        "meta": {...},
        "sections": [
            {"key": "cover_page", "title": "Cover Page", "payload": {...}},
            ...
        ],
    }
```

**Step 4: Run test to verify it passes**

Run: `cd /home/ika/repos/sentra-v2/sentra-backend && uv run --extra dev pytest tests/unit/services/analysis/test_request_template_materializer.py -q`
Expected: PASS.

**Step 5: Commit**

```bash
git -C /home/ika/repos/sentra-v2/sentra-backend add src/sentra_api/services/analysis/request_template_materializer.py tests/unit/services/analysis/test_request_template_materializer.py
git -C /home/ika/repos/sentra-v2/sentra-backend commit -m "feat: add strict request template analysis materializer"
```

### Task 5: Add Repository Method for Request Template Document

**Files:**
- Modify: `src/sentra_api/repositories/analytics_repo.py`
- Create: `tests/repositories/test_analytics_repository_request_template.py`

**Step 1: Write failing repository test**

```python
@pytest.mark.asyncio
async def test_get_request_template_document_returns_template_meta_and_sections() -> None:
    repo = AnalyticsRepository(_DummySession())
    payload = await repo.get_request_template_document(
        job_id="00000000-0000-0000-0000-000000000123",
        request_id="00000000-0000-0000-0000-000000000124",
        primary_entity="Acme",
    )
    assert payload["meta"]["report_contract"] == "request_template_v1"
    assert payload["sections"][0]["key"] == "cover_page"
```

**Step 2: Run test to verify it fails**

Run: `cd /home/ika/repos/sentra-v2/sentra-backend && uv run --extra dev pytest tests/repositories/test_analytics_repository_request_template.py -q`
Expected: FAIL because `get_request_template_document` is missing.

**Step 3: Implement minimal repository method**

```python
async def get_request_template_document(self, *, job_id: str, request_id: str, primary_entity: str, monitoring_period: dict[str, Any] | None = None) -> dict[str, Any]:
    overview = await self.get_overview(job_id)
    daily_metrics = await self.get_daily_metrics(job_id)
    sentiment_overview = await self.get_sentiment_overview(job_id)
    sentiment_by_topic = await self.get_sentiment_by_topic(job_id)
    top_influencers = await self.get_top_influencers(job_id, 10)
    sentiment_examples = await self.get_sentiment_examples(job_id, 20)
    return materialize_request_template_document(...)
```

**Step 4: Run test to verify it passes**

Run: `cd /home/ika/repos/sentra-v2/sentra-backend && uv run --extra dev pytest tests/repositories/test_analytics_repository_request_template.py tests/repositories/test_analytics_repository.py -q`
Expected: PASS.

**Step 5: Commit**

```bash
git -C /home/ika/repos/sentra-v2/sentra-backend add src/sentra_api/repositories/analytics_repo.py tests/repositories/test_analytics_repository_request_template.py
git -C /home/ika/repos/sentra-v2/sentra-backend commit -m "feat: add request template document builder in analytics repository"
```

### Task 6: Wire Form-Request Analysis Route End-to-End

**Files:**
- Modify: `src/sentra_api/api/routes/form_requests.py`
- Modify: `tests/api/test_form_requests_api_contract.py`
- Modify: `tests/unit/api/routes/test_form_requests_owner_scope.py`

**Step 1: Write failing route behavior tests**

```python
def test_form_requests_analysis_document_returns_404_when_request_missing(...): ...
def test_form_requests_analysis_document_returns_409_when_job_missing(...): ...
def test_form_requests_analysis_document_returns_report_for_owner(...): ...
```

**Step 2: Run test to verify it fails**

Run: `cd /home/ika/repos/sentra-v2/sentra-backend && uv run --extra dev pytest tests/api/test_form_requests_api_contract.py tests/unit/api/routes/test_form_requests_owner_scope.py -q`
Expected: FAIL on status code/response mismatches.

**Step 3: Implement full route logic**

```python
@router.get("/{request_id}/analysis-document", response_model=RequestAnalysisDocumentResponse)
async def get_form_request_analysis_document(...):
    record = await form_requests_repo.get_form_request_by_id(...)
    if record is None:
        raise HTTPException(status_code=404, detail="Form request not found")
    if record.job_id is None:
        raise HTTPException(status_code=409, detail="Request has no linked job yet")

    primary_entity = str(record.form_payload_json.get("primary_entity") or record.query)
    payload = await AnalyticsRepository(db).get_request_template_document(
        job_id=str(record.job_id),
        request_id=str(record.id),
        primary_entity=primary_entity,
        monitoring_period=record.normalization_json or {},
    )
    return RequestAnalysisDocumentResponse.model_validate(payload)
```

**Step 4: Run test to verify it passes**

Run: `cd /home/ika/repos/sentra-v2/sentra-backend && uv run --extra dev pytest tests/api/test_form_requests_api_contract.py tests/unit/api/routes/test_form_requests_owner_scope.py -q`
Expected: PASS.

**Step 5: Commit**

```bash
git -C /home/ika/repos/sentra-v2/sentra-backend add src/sentra_api/api/routes/form_requests.py tests/api/test_form_requests_api_contract.py tests/unit/api/routes/test_form_requests_owner_scope.py
git -C /home/ika/repos/sentra-v2/sentra-backend commit -m "feat: expose owner-scoped request analysis document endpoint"
```

### Task 7: Sync and Validate OpenAPI for New Request Analysis Route

**Files:**
- Modify: `openapi/sentra-openapi.yaml`
- Modify: `tests/api/test_openapi_contract.py`
- Verify: `tests/api/test_openapi_file_sync.py`

**Step 1: Write failing OpenAPI path assertion**

```python
assert "/v1/form-requests/{request_id}/analysis-document" in paths
```

**Step 2: Run test to verify it fails**

Run: `cd /home/ika/repos/sentra-v2/sentra-backend && uv run --extra dev pytest tests/api/test_openapi_contract.py -q`
Expected: FAIL because saved OpenAPI is not updated.

**Step 3: Export and save OpenAPI**

```bash
cd /home/ika/repos/sentra-v2/sentra-backend
uv run python scripts/export_openapi.py > openapi/sentra-openapi.yaml
```

**Step 4: Run OpenAPI tests to verify they pass**

Run: `cd /home/ika/repos/sentra-v2/sentra-backend && uv run --extra dev pytest tests/api/test_openapi_contract.py tests/api/test_openapi_file_sync.py -q`
Expected: PASS.

**Step 5: Commit**

```bash
git -C /home/ika/repos/sentra-v2/sentra-backend add openapi/sentra-openapi.yaml tests/api/test_openapi_contract.py
git -C /home/ika/repos/sentra-v2/sentra-backend commit -m "chore: sync openapi for request analysis document route"
```

### Task 8: Add Frontend Request Analysis API Contract and Types

**Files:**
- Modify: `src/features/sentra/types/formRequest.ts`
- Modify: `src/features/sentra/api/formRequests.ts`
- Modify: `src/features/sentra/__tests__/form-requests-api.test.ts`

**Step 1: Write failing API test**

```ts
it('gets request analysis document payload', async () => {
  // mock /v1/form-requests/{id}/analysis-document
  // assert typed payload includes meta.report_contract and ordered sections
});
```

**Step 2: Run test to verify it fails**

Run: `cd /home/ika/repos/sentra-v2/sentra-frontend && npm run test:run -- src/features/sentra/__tests__/form-requests-api.test.ts`
Expected: FAIL because API method/type does not exist.

**Step 3: Implement frontend types + API call**

```ts
export interface RequestAnalysisDocumentRecord {
  meta: { request_id: string; job_id: string; report_contract: string; generated_at: string };
  sections: Array<{ key: string; title: string; payload: Record<string, unknown> }>;
}

export async function getFormRequestAnalysisDocument(requestId: string): Promise<RequestAnalysisDocumentRecord> {
  const response = await apiFetch(`/v1/form-requests/${requestId}/analysis-document`);
  ...
}
```

**Step 4: Run test to verify it passes**

Run: `cd /home/ika/repos/sentra-v2/sentra-frontend && npm run test:run -- src/features/sentra/__tests__/form-requests-api.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git -C /home/ika/repos/sentra-v2/sentra-frontend add src/features/sentra/types/formRequest.ts src/features/sentra/api/formRequests.ts src/features/sentra/__tests__/form-requests-api.test.ts
git -C /home/ika/repos/sentra-v2/sentra-frontend commit -m "feat: add frontend request analysis document api contract"
```

### Task 9: Implement Request-Only Template Renderer (Interactive, Strict Order)

**Files:**
- Create: `src/features/sentra/components/requests/RequestTemplateAnalysisDocument.tsx`
- Create: `src/features/sentra/__tests__/request-template-analysis-document.test.tsx`

**Step 1: Write failing renderer tests for strict order**

```ts
it('renders all template sections in strict order', () => {
  // pass fixture payload with 12 sections
  // assert heading order matches template list
});

it('renders stance table and topic ranking table blocks', () => {
  // assert interactive table/chart blocks exist for required sections
});
```

**Step 2: Run test to verify it fails**

Run: `cd /home/ika/repos/sentra-v2/sentra-frontend && npm run test:run -- src/features/sentra/__tests__/request-template-analysis-document.test.tsx`
Expected: FAIL because component does not exist.

**Step 3: Implement minimal renderer**

```tsx
export function RequestTemplateAnalysisDocument({ document }: { document: RequestAnalysisDocumentRecord }) {
  return (
    <div data-testid="request-template-analysis-document">
      {document.sections.map((section) => (
        <section key={section.key} data-testid={`request-template-section-${section.key}`}>
          <h2>{section.title}</h2>
          {/* interactive cards/tables/charts per section key */}
        </section>
      ))}
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `cd /home/ika/repos/sentra-v2/sentra-frontend && npm run test:run -- src/features/sentra/__tests__/request-template-analysis-document.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git -C /home/ika/repos/sentra-v2/sentra-frontend add src/features/sentra/components/requests/RequestTemplateAnalysisDocument.tsx src/features/sentra/__tests__/request-template-analysis-document.test.tsx
git -C /home/ika/repos/sentra-v2/sentra-frontend commit -m "feat: add request-only strict template analysis renderer"
```

### Task 10: Wire Request Analysis Page to New Endpoint and Renderer

**Files:**
- Modify: `src/features/sentra/components/requests/RequestAnalysisPage.tsx`
- Modify: `src/features/sentra/__tests__/request-analysis-page.test.tsx`
- Modify: `src/features/sentra/__tests__/routes-smoke.test.tsx`

**Step 1: Write failing page test expectations**

```ts
it('loads request analysis from request endpoint and renders template document', async () => {
  // mock getFormRequest + getFormRequestAnalysisDocument
  // assert RequestTemplateAnalysisDocument receives template payload
});
```

**Step 2: Run test to verify it fails**

Run: `cd /home/ika/repos/sentra-v2/sentra-frontend && npm run test:run -- src/features/sentra/__tests__/request-analysis-page.test.tsx src/features/sentra/__tests__/routes-smoke.test.tsx`
Expected: FAIL because page still uses shared `AnalysisResultsDocument`.

**Step 3: Implement page wiring**

```tsx
const analysisDocument = await getFormRequestAnalysisDocument(resolvedRequestId);
...
<RequestTemplateAnalysisDocument document={analysisDocument} />
```

**Step 4: Run test to verify it passes**

Run: `cd /home/ika/repos/sentra-v2/sentra-frontend && npm run test:run -- src/features/sentra/__tests__/request-analysis-page.test.tsx src/features/sentra/__tests__/routes-smoke.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git -C /home/ika/repos/sentra-v2/sentra-frontend add src/features/sentra/components/requests/RequestAnalysisPage.tsx src/features/sentra/__tests__/request-analysis-page.test.tsx src/features/sentra/__tests__/routes-smoke.test.tsx
git -C /home/ika/repos/sentra-v2/sentra-frontend commit -m "feat: wire request analysis page to request template endpoint"
```

### Task 11: Regression Guard for Chat Analysis Isolation

**Files:**
- Modify: `src/features/sentra/__tests__/analysis-results-document-backend.test.tsx`
- Modify: `src/features/sentra/components/AnalysisResultsDocument.tsx` (only if test requires minor compatibility fix)

**Step 1: Write/extend failing regression test**

```ts
it('chat analysis document still uses /v1/jobs/{jobId}/analysis-document', async () => {
  // render AnalysisResultsDocument
  // assert fetch called with jobs analysis endpoint, not form-requests endpoint
});
```

**Step 2: Run test to verify it fails (if behavior drift exists)**

Run: `cd /home/ika/repos/sentra-v2/sentra-frontend && npm run test:run -- src/features/sentra/__tests__/analysis-results-document-backend.test.tsx`
Expected: PASS if already isolated, otherwise FAIL requiring minimal fix.

**Step 3: Apply minimal fix only if needed**

```tsx
// keep existing getAnalysisDocument(jobId) path unchanged
```

**Step 4: Run test to verify it passes**

Run: `cd /home/ika/repos/sentra-v2/sentra-frontend && npm run test:run -- src/features/sentra/__tests__/analysis-results-document-backend.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git -C /home/ika/repos/sentra-v2/sentra-frontend add src/features/sentra/__tests__/analysis-results-document-backend.test.tsx src/features/sentra/components/AnalysisResultsDocument.tsx
git -C /home/ika/repos/sentra-v2/sentra-frontend commit -m "test: lock chat analysis endpoint isolation from request template flow"
```

### Task 12: Full Verification and Docs Notes

**Files:**
- Modify: `docs/plans/2026-03-06-request-template-analysis-refactor-design.md` (optional final implementation notes)

**Step 1: Run focused backend suites**

Run: `cd /home/ika/repos/sentra-v2/sentra-backend && uv run --extra dev pytest tests/api/test_form_requests_api_contract.py tests/unit/api/routes/test_form_requests_owner_scope.py tests/repositories/test_analytics_repository.py tests/repositories/test_analytics_repository_request_template.py tests/unit/services/analysis/test_request_template_metrics.py tests/unit/services/analysis/test_request_template_materializer.py tests/api/test_openapi_contract.py tests/api/test_openapi_file_sync.py -q`
Expected: PASS.

**Step 2: Run focused frontend suites**

Run: `cd /home/ika/repos/sentra-v2/sentra-frontend && npm run test:run -- src/features/sentra/__tests__/form-requests-api.test.ts src/features/sentra/__tests__/request-template-analysis-document.test.tsx src/features/sentra/__tests__/request-analysis-page.test.tsx src/features/sentra/__tests__/routes-smoke.test.tsx src/features/sentra/__tests__/analysis-results-document-backend.test.tsx`
Expected: PASS.

**Step 3: Run targeted lint/type checks as needed**

Run: `cd /home/ika/repos/sentra-v2/sentra-frontend && npm run test:run -- src/features/sentra/__tests__/request-detail-page.test.tsx`
Expected: PASS for adjacent request flow regression.

**Step 4: Record any formula assumptions and confidence tiers**

```markdown
# append brief notes in design doc or verification artifact
- shares metric uses modeled estimate from persisted engagement fields when explicit share count is unavailable
- backlash tier thresholds are deterministic and versioned under request_template_v1
```

**Step 5: Commit**

```bash
git -C /home/ika/repos/sentra-v2/sentra-backend commit -m "chore: verify request template analysis rollout"
git -C /home/ika/repos/sentra-v2/sentra-frontend commit -m "chore: verify request template analysis ui rollout"
```

---

Implementation completion criteria:
1. `/v1/form-requests/{request_id}/analysis-document` returns strict template section order and request-scoped metadata.
2. `/request-history/:requestId/analysis` renders request-only template document in interactive web format.
3. Chat analysis rendering remains unchanged and continues using `/v1/jobs/{jobId}/analysis-document`.
4. OpenAPI and tests are fully green for both repositories.
