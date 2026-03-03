# Analysis Results Document Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current in-chat Intelligence Brief with a full in-chat Analysis Results Document (all reference sections), powered by backend real-data contracts and updated sentiment taxonomy (stance + emotion).

**Architecture:** Add a single backend read contract `GET /v1/jobs/{jobId}/analysis-document` that returns fully derived section payloads. Extend sentiment persistence/pipeline to carry stance and emotion categories so downstream section builders use stored real signals. Replace frontend brief rendering with a new `AnalysisResultsDocument` component while preserving current design language and chat embedding.

**Tech Stack:** FastAPI, SQLAlchemy, Alembic, Pydantic, pytest, React 18, TypeScript, Recharts, Vitest, React Testing Library.

---

**Execution notes**
- Follow `@test-driven-development` for every task.
- Keep commits small (one commit per task).
- Use backend repo for backend commits and frontend repo for frontend commits.
- Backend repo root: `/home/ika/repos/sentra-v2/sentra-backend`
- Frontend repo root: `/home/ika/repos/sentra-v2/sentra-frontend`

### Task 1: Add Backend API Contract for Analysis Document

**Files:**
- Modify: `../sentra-backend/tests/unit/api/routes/test_job_analytics_owner_scope.py`
- Modify: `../sentra-backend/src/sentra_api/schemas/analytics.py`
- Modify: `../sentra-backend/src/sentra_api/api/routes/analytics.py`

**Step 1: Write the failing test**

```python
@pytest.mark.asyncio
async def test_analysis_document_allows_owner(monkeypatch: pytest.MonkeyPatch) -> None:
    job_id = uuid4()
    owner_user_id = uuid4()

    async def _fake_get_job_by_id(self, requested_job_id, *, user_id):  # noqa: ANN001
        if requested_job_id != job_id or user_id != owner_user_id:
            return None
        now = datetime.now(UTC)
        return JobResponse(
            id=job_id,
            query="acme",
            status="completed",
            inserted_at=now,
            updated_at=now,
            error_message=None,
        )

    async def _fake_get_analysis_document(self, job_id_str: str):  # noqa: ANN001
        assert job_id_str == str(job_id)
        return {
            "job_id": str(job_id),
            "meta": {"campaign_name": "X", "entity": "Y"},
            "sections": {"cover": {"title": "Analysis Results Document"}},
        }

    monkeypatch.setattr(analytics_routes.JobsRepository, "get_job_by_id", _fake_get_job_by_id)
    monkeypatch.setattr(
        analytics_routes.AnalyticsRepository,
        "get_analysis_document",
        _fake_get_analysis_document,
    )

    payload = await analytics_routes.get_analysis_document(
        jobId=job_id,
        principal={"sub": str(owner_user_id), "email": "owner@example.com", "role": "user"},
        db=object(),
    )
    assert payload.job_id == str(job_id)
```

**Step 2: Run test to verify it fails**

Run: `cd /home/ika/repos/sentra-v2/sentra-backend && uv run --extra dev pytest tests/unit/api/routes/test_job_analytics_owner_scope.py -k analysis_document -q`  
Expected: FAIL because `get_analysis_document` route/schema does not exist.

**Step 3: Write minimal implementation**

```python
# src/sentra_api/schemas/analytics.py
class AnalysisDocumentResponse(BaseModel):
    job_id: str
    meta: dict[str, Any] = Field(default_factory=dict)
    sections: dict[str, Any] = Field(default_factory=dict)

# src/sentra_api/api/routes/analytics.py
@router.get("/analysis-document", response_model=AnalysisDocumentResponse)
async def get_analysis_document(...):
    await _ensure_owned_job(...)
    repo = AnalyticsRepository(db)
    data = await repo.get_analysis_document(str(jobId))
    return AnalysisDocumentResponse.model_validate(data)
```

**Step 4: Run test to verify it passes**

Run: `cd /home/ika/repos/sentra-v2/sentra-backend && uv run --extra dev pytest tests/unit/api/routes/test_job_analytics_owner_scope.py -k analysis_document -q`  
Expected: PASS.

**Step 5: Commit**

```bash
cd /home/ika/repos/sentra-v2/sentra-backend
git add tests/unit/api/routes/test_job_analytics_owner_scope.py src/sentra_api/schemas/analytics.py src/sentra_api/api/routes/analytics.py
git commit -m "feat: add analysis document route contract"
```

### Task 2: Implement Repository Builder for Full Analysis Document Payload

**Files:**
- Modify: `../sentra-backend/tests/repositories/test_analytics_repository.py`
- Modify: `../sentra-backend/src/sentra_api/repositories/analytics_repo.py`

**Step 1: Write the failing test**

```python
@pytest.mark.asyncio
async def test_analysis_document_includes_required_sections() -> None:
    db = _DummySession()
    repo = AnalyticsRepository(db)
    payload = await repo.get_analysis_document("00000000-0000-0000-0000-000000000123")

    assert payload["job_id"] == "00000000-0000-0000-0000-000000000123"
    required_sections = {
        "cover",
        "executive_key_metrics",
        "sentiment_emotional_distribution",
        "stance_distribution_analysis",
        "stance_drivers",
        "negative_reception_analysis",
        "topic_cluster_analysis",
        "engagement_decay_curve",
        "influencer_impact_analysis",
        "audience_behavior_insights",
        "ai_strategic_insight_summary",
        "campaign_predictions",
        "strategic_conclusion",
    }
    assert required_sections.issubset(payload["sections"].keys())
```

**Step 2: Run test to verify it fails**

Run: `cd /home/ika/repos/sentra-v2/sentra-backend && uv run --extra dev pytest tests/repositories/test_analytics_repository.py -k analysis_document -q`  
Expected: FAIL because `get_analysis_document` repository method is missing.

**Step 3: Write minimal implementation**

```python
class AnalyticsRepository:
    async def get_analysis_document(self, job_id: str) -> dict[str, Any]:
        overview = await self.get_overview(job_id)
        sentiment_overview = await self.get_sentiment_overview(job_id)
        topic_rows = await self.get_sentiment_by_topic(job_id)
        source_rows = await self.get_sentiment_by_source(job_id)
        examples = await self.get_sentiment_examples(job_id, 20)
        influencers = await self.get_top_influencers(job_id, 10)
        daily_metrics = await self.get_daily_metrics(job_id)

        return {
            "job_id": job_id,
            "meta": {...},
            "sections": {
                "cover": {...},
                "executive_key_metrics": {...},
                "sentiment_emotional_distribution": {...},
                "stance_distribution_analysis": {...},
                "stance_drivers": {...},
                "negative_reception_analysis": {...},
                "topic_cluster_analysis": {...},
                "engagement_decay_curve": {...},
                "influencer_impact_analysis": {...},
                "audience_behavior_insights": {...},
                "ai_strategic_insight_summary": {...},
                "campaign_predictions": {...},
                "strategic_conclusion": {...},
            },
        }
```

**Step 4: Run test to verify it passes**

Run: `cd /home/ika/repos/sentra-v2/sentra-backend && uv run --extra dev pytest tests/repositories/test_analytics_repository.py -k analysis_document -q`  
Expected: PASS.

**Step 5: Commit**

```bash
cd /home/ika/repos/sentra-v2/sentra-backend
git add tests/repositories/test_analytics_repository.py src/sentra_api/repositories/analytics_repo.py
git commit -m "feat: build analysis document payload in analytics repository"
```

### Task 3: Add Stance/Emotion Persistence Fields (DB + Models)

**Files:**
- Create: `../sentra-backend/alembic/versions/20260303_12_add_stance_emotion_labels.py`
- Modify: `../sentra-backend/tests/unit/db/test_analytics_index_migration.py`
- Modify: `../sentra-backend/src/sentra_api/db/models/post_sentiments.py`
- Modify: `../sentra-backend/src/sentra_api/db/models/comment_sentiments.py`

**Step 1: Write the failing test**

```python
def test_sentiment_tables_include_stance_and_emotion_columns() -> None:
    source = Path("alembic/versions/20260303_12_add_stance_emotion_labels.py").read_text(encoding="utf-8")
    assert "stance_label" in source
    assert "emotion_label" in source
```

**Step 2: Run test to verify it fails**

Run: `cd /home/ika/repos/sentra-v2/sentra-backend && uv run --extra dev pytest tests/unit/db/test_analytics_index_migration.py -k stance -q`  
Expected: FAIL because migration file/columns do not exist.

**Step 3: Write minimal implementation**

```python
# alembic migration upgrade()
op.add_column("post_sentiments", sa.Column("stance_label", sa.String(length=32), nullable=True))
op.add_column("post_sentiments", sa.Column("emotion_label", sa.String(length=32), nullable=True))
op.add_column("comment_sentiments", sa.Column("stance_label", sa.String(length=32), nullable=True))
op.add_column("comment_sentiments", sa.Column("emotion_label", sa.String(length=32), nullable=True))

# models
stance_label: Mapped[str | None] = mapped_column(String(32), nullable=True)
emotion_label: Mapped[str | None] = mapped_column(String(32), nullable=True)
```

**Step 4: Run test to verify it passes**

Run: `cd /home/ika/repos/sentra-v2/sentra-backend && uv run --extra dev pytest tests/unit/db/test_analytics_index_migration.py -k stance -q`  
Expected: PASS.

**Step 5: Commit**

```bash
cd /home/ika/repos/sentra-v2/sentra-backend
git add alembic/versions/20260303_12_add_stance_emotion_labels.py tests/unit/db/test_analytics_index_migration.py src/sentra_api/db/models/post_sentiments.py src/sentra_api/db/models/comment_sentiments.py
git commit -m "feat: persist stance and emotion labels on sentiment rows"
```

### Task 4: Extend Sentiment Provider Output to Include Stance and Emotion

**Files:**
- Modify: `../sentra-backend/tests/unit/integrations/llm/test_langchain_gemini_adapter.py`
- Modify: `../sentra-backend/src/sentra_api/integrations/llm/provider.py`
- Modify: `../sentra-backend/src/sentra_api/integrations/llm/langchain_adapter.py`
- Modify: `../sentra-backend/src/sentra_api/services/analysis/sentiment_service.py`

**Step 1: Write the failing test**

```python
def test_heuristic_classify_returns_stance_and_emotion() -> None:
    output = LangChainAdapter._heuristic_classify(["I love this launch but worried about delivery."])
    assert output[0].stance in {"support", "strongly_support", "neutral", "oppose", "strongly_oppose"}
    assert output[0].emotion in {
        "supportive","curious","neutral","critical","concerned","dismissive","angry","humorous","hopeful"
    }
```

**Step 2: Run test to verify it fails**

Run: `cd /home/ika/repos/sentra-v2/sentra-backend && uv run --extra dev pytest tests/unit/integrations/llm/test_langchain_gemini_adapter.py -k stance -q`  
Expected: FAIL because `SentimentResult` lacks stance/emotion fields.

**Step 3: Write minimal implementation**

```python
# provider.py
StanceLabel = Literal["strongly_support", "support", "neutral", "oppose", "strongly_oppose"]
EmotionLabel = Literal["supportive", "curious", "neutral", "critical", "concerned", "dismissive", "angry", "humorous", "hopeful"]

class SentimentResult(BaseModel):
    text: str
    label: SentimentLabel
    polarity_score: float = Field(ge=-1.0, le=1.0)
    stance: StanceLabel = "neutral"
    emotion: EmotionLabel = "neutral"
```

```python
# langchain_adapter.py parse + heuristic defaults
stance = str(item.get("stance", "neutral"))
emotion = str(item.get("emotion", "neutral"))
...
SentimentResult(text=..., label=label, polarity_score=polarity, stance=stance, emotion=emotion)
```

**Step 4: Run test to verify it passes**

Run: `cd /home/ika/repos/sentra-v2/sentra-backend && uv run --extra dev pytest tests/unit/integrations/llm/test_langchain_gemini_adapter.py -k stance -q`  
Expected: PASS.

**Step 5: Commit**

```bash
cd /home/ika/repos/sentra-v2/sentra-backend
git add tests/unit/integrations/llm/test_langchain_gemini_adapter.py src/sentra_api/integrations/llm/provider.py src/sentra_api/integrations/llm/langchain_adapter.py src/sentra_api/services/analysis/sentiment_service.py
git commit -m "feat: add stance and emotion to sentiment provider output"
```

### Task 5: Persist Stance/Emotion in Sentiment Stage and Expose in Repository Queries

**Files:**
- Modify: `../sentra-backend/tests/unit/services/orchestration/stages/test_sentiment_stage.py`
- Modify: `../sentra-backend/tests/unit/repositories/test_analytics_repository_edges.py`
- Modify: `../sentra-backend/src/sentra_api/services/orchestration/stages/sentiment_stage.py`
- Modify: `../sentra-backend/src/sentra_api/repositories/analytics_repo.py`

**Step 1: Write the failing test**

```python
@pytest.mark.asyncio
async def test_sentiment_stage_upserts_stance_and_emotion() -> None:
    ...
    sql_blob = "\n".join(session.executed).lower()
    assert "stance_label" in sql_blob
    assert "emotion_label" in sql_blob
```

**Step 2: Run test to verify it fails**

Run: `cd /home/ika/repos/sentra-v2/sentra-backend && uv run --extra dev pytest tests/unit/services/orchestration/stages/test_sentiment_stage.py -k stance -q`  
Expected: FAIL because stage upserts only sentiment label and polarity.

**Step 3: Write minimal implementation**

```python
# sentiment_stage.py row payloads
"stance_label": result.stance,
"emotion_label": result.emotion,
...
"stance_label": insert_statement.excluded.stance_label,
"emotion_label": insert_statement.excluded.emotion_label,
```

```python
# analytics_repo.py add helpers to aggregate stance/emotion counts used in analysis-document sections
async def _stance_counts(self, job_id: str) -> dict[str, int]: ...
async def _emotion_counts(self, job_id: str) -> dict[str, int]: ...
```

**Step 4: Run test to verify it passes**

Run: `cd /home/ika/repos/sentra-v2/sentra-backend && uv run --extra dev pytest tests/unit/services/orchestration/stages/test_sentiment_stage.py tests/unit/repositories/test_analytics_repository_edges.py -k "stance or emotion" -q`  
Expected: PASS.

**Step 5: Commit**

```bash
cd /home/ika/repos/sentra-v2/sentra-backend
git add tests/unit/services/orchestration/stages/test_sentiment_stage.py tests/unit/repositories/test_analytics_repository_edges.py src/sentra_api/services/orchestration/stages/sentiment_stage.py src/sentra_api/repositories/analytics_repo.py
git commit -m "feat: persist and aggregate stance emotion signals"
```

### Task 6: Add Frontend API Client for Analysis Document and New Component Contract Tests

**Files:**
- Create: `src/features/sentra/__tests__/analysis-results-document-backend.test.tsx`
- Modify: `src/features/sentra/api/analytics.ts`
- Create: `src/features/sentra/components/AnalysisResultsDocument.tsx`

**Step 1: Write the failing test**

```tsx
it('renders all required analysis document section headers from backend payload', async () => {
  vi.spyOn(global, 'fetch').mockResolvedValueOnce(
    new Response(JSON.stringify({
      job_id: '120d6e13-9f74-42bb-9fff-395a7f4f5f00',
      meta: { campaign_name: 'Tesla Model Y Launch Campaign' },
      sections: {
        cover: {},
        executive_key_metrics: {},
        sentiment_emotional_distribution: {},
        stance_distribution_analysis: {},
        stance_drivers: {},
        negative_reception_analysis: {},
        topic_cluster_analysis: {},
        engagement_decay_curve: {},
        influencer_impact_analysis: {},
        audience_behavior_insights: {},
        ai_strategic_insight_summary: {},
        campaign_predictions: {},
        strategic_conclusion: {},
      },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
  );
  render(<AnalysisResultsDocument query="Tesla model y sentiment" jobId="120d6e13-9f74-42bb-9fff-395a7f4f5f00" />);
  expect(await screen.findByText(/executive key metrics/i)).toBeInTheDocument();
  expect(screen.getByText(/campaign predictions/i)).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `cd /home/ika/repos/sentra-v2/sentra-frontend && npm run test:run -- src/features/sentra/__tests__/analysis-results-document-backend.test.tsx`  
Expected: FAIL because API contract/component do not exist.

**Step 3: Write minimal implementation**

```ts
// api/analytics.ts
export interface AnalysisDocumentResponse {
  job_id: string;
  meta: Record<string, unknown>;
  sections: Record<string, unknown>;
}

export const getAnalysisDocument = (jobId: string): Promise<AnalysisDocumentResponse> =>
  getJson<AnalysisDocumentResponse>(`/v1/jobs/${jobId}/analysis-document`);
```

```tsx
// components/AnalysisResultsDocument.tsx
export function AnalysisResultsDocument({ query, jobId }: { query: string; jobId?: string }) {
  // fetch once + render section containers with existing card styles
}
```

**Step 4: Run test to verify it passes**

Run: `cd /home/ika/repos/sentra-v2/sentra-frontend && npm run test:run -- src/features/sentra/__tests__/analysis-results-document-backend.test.tsx`  
Expected: PASS.

**Step 5: Commit**

```bash
cd /home/ika/repos/sentra-v2/sentra-frontend
git add src/features/sentra/__tests__/analysis-results-document-backend.test.tsx src/features/sentra/api/analytics.ts src/features/sentra/components/AnalysisResultsDocument.tsx
git commit -m "feat: add frontend analysis document api and component"
```

### Task 7: Replace Intelligence Brief Rendering Path with Analysis Results Document

**Files:**
- Modify: `src/features/sentra/components/chat/IntelligenceBriefBubble.tsx`
- Modify: `src/features/sentra/components/chat/ConversationPanel.tsx`
- Modify: `src/features/sentra/components/AppShell.tsx`
- Modify: `src/features/sentra/__tests__/conversation-panel-brief-bubble.test.tsx`
- Modify: `src/features/sentra/__tests__/chat-confirmation-flow.test.tsx`
- Modify: `src/features/sentra/__tests__/chat-streaming-flow.test.tsx`

**Step 1: Write the failing test**

```tsx
it('renders analysis results document inside assistant brief bubble', () => {
  render(<ConversationPanel ... />);
  expect(screen.getByTestId('chat-analysis-results-document')).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `cd /home/ika/repos/sentra-v2/sentra-frontend && npm run test:run -- src/features/sentra/__tests__/conversation-panel-brief-bubble.test.tsx`  
Expected: FAIL because bubble still renders `IntelligenceBrief`.

**Step 3: Write minimal implementation**

```tsx
// IntelligenceBriefBubble.tsx (keep filename for now to avoid broad churn)
import { AnalysisResultsDocument } from '@/features/sentra/components/AnalysisResultsDocument';
...
<div data-testid="chat-analysis-results-document">
  <AnalysisResultsDocument query={query} jobId={jobId} />
</div>
```

**Step 4: Run test to verify it passes**

Run: `cd /home/ika/repos/sentra-v2/sentra-frontend && npm run test:run -- src/features/sentra/__tests__/conversation-panel-brief-bubble.test.tsx src/features/sentra/__tests__/chat-confirmation-flow.test.tsx src/features/sentra/__tests__/chat-streaming-flow.test.tsx`  
Expected: PASS.

**Step 5: Commit**

```bash
cd /home/ika/repos/sentra-v2/sentra-frontend
git add src/features/sentra/components/chat/IntelligenceBriefBubble.tsx src/features/sentra/components/chat/ConversationPanel.tsx src/features/sentra/components/AppShell.tsx src/features/sentra/__tests__/conversation-panel-brief-bubble.test.tsx src/features/sentra/__tests__/chat-confirmation-flow.test.tsx src/features/sentra/__tests__/chat-streaming-flow.test.tsx
git commit -m "feat: route assistant brief bubbles to analysis results document"
```

### Task 8: Add Inline Error/Retry Behavior in Analysis Document Component

**Files:**
- Modify: `src/features/sentra/__tests__/analysis-results-document-backend.test.tsx`
- Modify: `src/features/sentra/components/AnalysisResultsDocument.tsx`

**Step 1: Write the failing test**

```tsx
it('shows inline retry control when analysis-document request fails', async () => {
  const fetchMock = vi.spyOn(global, 'fetch')
    .mockResolvedValueOnce(new Response(JSON.stringify({ detail: 'boom' }), { status: 500 }))
    .mockResolvedValueOnce(new Response(JSON.stringify(validPayload), { status: 200, headers: { 'Content-Type': 'application/json' } }));

  const user = userEvent.setup();
  render(<AnalysisResultsDocument query="x" jobId="120d6e13-9f74-42bb-9fff-395a7f4f5f00" />);
  expect(await screen.findByText(/could not load analysis results document/i)).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /retry/i }));
  expect(await screen.findByText(/executive key metrics/i)).toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledTimes(2);
});
```

**Step 2: Run test to verify it fails**

Run: `cd /home/ika/repos/sentra-v2/sentra-frontend && npm run test:run -- src/features/sentra/__tests__/analysis-results-document-backend.test.tsx -t "inline retry"`  
Expected: FAIL because error state and retry control are missing.

**Step 3: Write minimal implementation**

```tsx
if (error) {
  return (
    <div className="rounded-lg border border-border bg-card p-6" data-testid="analysis-document-error">
      <p className="text-sm text-muted-foreground">Could not load analysis results document.</p>
      <button type="button" onClick={reload} className="mt-3 rounded border border-border px-3 py-1.5 text-sm">
        Retry
      </button>
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `cd /home/ika/repos/sentra-v2/sentra-frontend && npm run test:run -- src/features/sentra/__tests__/analysis-results-document-backend.test.tsx`  
Expected: PASS.

**Step 5: Commit**

```bash
cd /home/ika/repos/sentra-v2/sentra-frontend
git add src/features/sentra/__tests__/analysis-results-document-backend.test.tsx src/features/sentra/components/AnalysisResultsDocument.tsx
git commit -m "feat: add inline retry state for analysis document loading"
```

### Task 9: Update OpenAPI Contract and Full Regression Test Gates

**Files:**
- Modify: `../sentra-backend/tests/api/test_openapi_contract.py`
- Modify: `../sentra-backend/openapi/sentra-openapi.yaml`

**Step 1: Write the failing test**

```python
def test_required_mvp_paths_present_in_saved_openapi() -> None:
    ...
    assert "/v1/jobs/{jobId}/analysis-document" in paths
```

**Step 2: Run test to verify it fails**

Run: `cd /home/ika/repos/sentra-v2/sentra-backend && uv run --extra dev pytest tests/api/test_openapi_contract.py tests/api/test_openapi_file_sync.py -q`  
Expected: FAIL because path is not in saved OpenAPI yet.

**Step 3: Write minimal implementation**

```bash
cd /home/ika/repos/sentra-v2/sentra-backend
uv run python scripts/export_openapi.py > openapi/sentra-openapi.yaml
```

**Step 4: Run test to verify it passes**

Run: `cd /home/ika/repos/sentra-v2/sentra-backend && uv run --extra dev pytest tests/unit/api/routes/test_job_analytics_owner_scope.py tests/repositories/test_analytics_repository.py tests/unit/services/orchestration/stages/test_sentiment_stage.py tests/api/test_openapi_contract.py tests/api/test_openapi_file_sync.py -q`  
Expected: PASS.

**Step 5: Commit**

```bash
cd /home/ika/repos/sentra-v2/sentra-backend
git add tests/api/test_openapi_contract.py openapi/sentra-openapi.yaml
git commit -m "docs: add analysis document openapi contract"
```

### Task 10: Final Frontend Regression Sweep

**Files:**
- Verify only: `src/features/sentra/components/AnalysisResultsDocument.tsx`
- Verify only: `src/features/sentra/components/chat/IntelligenceBriefBubble.tsx`
- Verify only: `src/features/sentra/components/chat/ConversationPanel.tsx`
- Verify only: `src/features/sentra/components/AppShell.tsx`
- Verify only: `src/features/sentra/__tests__/analysis-results-document-backend.test.tsx`

**Step 1: Run targeted frontend suite**

Run: `cd /home/ika/repos/sentra-v2/sentra-frontend && npm run test:run -- src/features/sentra/__tests__/analysis-results-document-backend.test.tsx src/features/sentra/__tests__/conversation-panel-brief-bubble.test.tsx src/features/sentra/__tests__/chat-confirmation-flow.test.tsx src/features/sentra/__tests__/chat-streaming-flow.test.tsx`
Expected: PASS.

**Step 2: Run lint/build gates**

Run: `cd /home/ika/repos/sentra-v2/sentra-frontend && npm run lint && npm run build`
Expected: PASS.

**Step 3: Commit final frontend cleanup**

```bash
cd /home/ika/repos/sentra-v2/sentra-frontend
git add src/features/sentra/components/AnalysisResultsDocument.tsx src/features/sentra/components/chat/IntelligenceBriefBubble.tsx src/features/sentra/components/chat/ConversationPanel.tsx src/features/sentra/components/AppShell.tsx src/features/sentra/__tests__/analysis-results-document-backend.test.tsx
git commit -m "test: finalize analysis results document regression coverage"
```

---

Plan complete and saved to `docs/plans/2026-03-03-analysis-results-document-implementation-plan.md`. Two execution options:

1. Subagent-Driven (this session) - I dispatch a fresh subagent per task, review between tasks, fast iteration.
2. Parallel Session (separate) - Open a new session with executing-plans, batch execution with checkpoints.

Which approach?
