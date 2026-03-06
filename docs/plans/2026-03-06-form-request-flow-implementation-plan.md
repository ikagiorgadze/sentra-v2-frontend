# Form Request Flow And Separate History Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a non-chat form request workflow with separate request history URLs while keeping existing `/chat` behavior unchanged and sharing the same job pipeline/report renderer after job creation.

**Architecture:** Introduce a new backend `form_requests` domain (table + repository + API routes) that stores structured request payload plus frontend-generated query and links to a standard job. On the frontend, add dedicated request pages/routes (`/request-form`, `/request-history`, `/request-history/:requestId`) and a separate API client/state path, without reusing conversation history. Keep `AnalysisResultsDocument` shared, and add the missing `Influencer Impact Analysis` section in the renderer.

**Tech Stack:** FastAPI, SQLAlchemy, Alembic, Celery, Pydantic, React 18, TypeScript, React Router, Vitest, Pytest.

---

### Task 1: Backend Schema For Form Requests

**Files:**
- Create: `sentra-backend/alembic/versions/20260306_16_add_form_requests_table.py`
- Create: `sentra-backend/src/sentra_api/db/models/form_requests.py`
- Modify: `sentra-backend/src/sentra_api/db/models/__init__.py`
- Test: `sentra-backend/tests/unit/db/test_form_requests_migration.py`

**Step 1: Write the failing test**

```python
from pathlib import Path


def test_form_requests_migration_contains_required_columns() -> None:
    path = Path("alembic/versions/20260306_16_add_form_requests_table.py")
    assert path.exists(), "Create form_requests migration before enabling this test"

    source = path.read_text(encoding="utf-8")
    assert "form_requests" in source
    assert "owner_user_id" in source
    assert "query" in source
    assert "form_payload_json" in source
    assert "job_id" in source
```

**Step 2: Run test to verify it fails**

Run: `cd /home/ika/repos/sentra-v2/sentra-backend && uv run --extra dev python -m pytest tests/unit/db/test_form_requests_migration.py -q`
Expected: FAIL (migration file missing).

**Step 3: Write minimal implementation**

```python
class FormRequest(TimestampSoftDeleteMixin, Base):
    __tablename__ = "form_requests"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    owner_user_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("app_users.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="submitted")
    query: Mapped[str] = mapped_column(Text, nullable=False)
    form_payload_json: Mapped[dict] = mapped_column(JSONB, nullable=False)
    normalization_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    job_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("jobs.id"), nullable=True)
```

**Step 4: Run test to verify it passes**

Run: `cd /home/ika/repos/sentra-v2/sentra-backend && uv run --extra dev python -m pytest tests/unit/db/test_form_requests_migration.py -q`
Expected: PASS.

**Step 5: Commit**

```bash
git -C /home/ika/repos/sentra-v2/sentra-backend add \
  alembic/versions/20260306_16_add_form_requests_table.py \
  src/sentra_api/db/models/form_requests.py \
  src/sentra_api/db/models/__init__.py \
  tests/unit/db/test_form_requests_migration.py
git -C /home/ika/repos/sentra-v2/sentra-backend commit -m "feat: add form_requests persistence model and migration"
```

### Task 2: Backend Form Request Schemas And Repository

**Files:**
- Create: `sentra-backend/src/sentra_api/schemas/form_requests.py`
- Create: `sentra-backend/src/sentra_api/repositories/form_requests_repo.py`
- Test: `sentra-backend/tests/unit/repositories/test_form_requests_repo.py`

**Step 1: Write the failing test**

```python
async def test_create_form_request_persists_payload_and_query(repo: FormRequestsRepository) -> None:
    record = await repo.create_form_request(
        owner_user_id=user_id,
        query="Brand sentiment in Romania last 7 days",
        form_payload_json={"organization_name": "Acme"},
        normalization_json={"timeframe": "7d"},
    )
    assert record.query == "Brand sentiment in Romania last 7 days"
    assert record.form_payload_json["organization_name"] == "Acme"
    assert record.status == "submitted"
```

**Step 2: Run test to verify it fails**

Run: `cd /home/ika/repos/sentra-v2/sentra-backend && uv run --extra dev python -m pytest tests/unit/repositories/test_form_requests_repo.py -q`
Expected: FAIL (repository/schema missing).

**Step 3: Write minimal implementation**

```python
class CreateFormRequestRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    query: str = Field(min_length=1, max_length=512)
    form_payload: dict[str, Any]

class FormRequestResponse(BaseModel):
    id: UUID
    owner_user_id: UUID
    status: Literal["submitted", "running", "completed", "failed"]
    query: str
    form_payload_json: dict[str, Any]
    normalization_json: dict[str, Any] | None = None
    job_id: UUID | None = None
```

```python
class FormRequestsRepository:
    async def create_form_request(...): ...
    async def get_form_request_by_id(...): ...
    async def list_form_requests(...): ...
    async def attach_job(...): ...
```

**Step 4: Run test to verify it passes**

Run: `cd /home/ika/repos/sentra-v2/sentra-backend && uv run --extra dev python -m pytest tests/unit/repositories/test_form_requests_repo.py -q`
Expected: PASS.

**Step 5: Commit**

```bash
git -C /home/ika/repos/sentra-v2/sentra-backend add \
  src/sentra_api/schemas/form_requests.py \
  src/sentra_api/repositories/form_requests_repo.py \
  tests/unit/repositories/test_form_requests_repo.py
git -C /home/ika/repos/sentra-v2/sentra-backend commit -m "feat: add form request schemas and repository"
```

### Task 3: Backend Form Request Routes And Job Creation Wiring

**Files:**
- Create: `sentra-backend/src/sentra_api/api/routes/form_requests.py`
- Modify: `sentra-backend/src/sentra_api/api/v1/router.py`
- Modify: `sentra-backend/src/sentra_api/repositories/jobs_repo.py`
- Test: `sentra-backend/tests/api/test_form_requests_api_contract.py`
- Test: `sentra-backend/tests/unit/api/routes/test_form_requests_owner_scope.py`

**Step 1: Write the failing test**

```python
def test_create_form_request_creates_linked_job(monkeypatch) -> None:
    response = client.post(
        "/v1/form-requests",
        headers={"Authorization": "Bearer test-user-key"},
        json={
            "query": "Acme sentiment in Romania last 7 days",
            "form_payload": {"organization_name": "Acme"},
        },
    )
    assert response.status_code == 201
    payload = response.json()
    assert payload["request"]["query"] == "Acme sentiment in Romania last 7 days"
    assert payload["job"]["status"] == "queued"
```

**Step 2: Run test to verify it fails**

Run: `cd /home/ika/repos/sentra-v2/sentra-backend && uv run --extra dev python -m pytest tests/api/test_form_requests_api_contract.py tests/unit/api/routes/test_form_requests_owner_scope.py -q`
Expected: FAIL (route not registered).

**Step 3: Write minimal implementation**

```python
router = APIRouter(prefix="/form-requests", tags=["FormRequests"], dependencies=[Depends(require_authenticated_user)])

@router.post("", response_model=CreateFormRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_form_request(...):
    request_record = await form_requests_repo.create_form_request(...)
    job = await jobs_repo.create_job(query=payload.query, owner_user_id=user_id)
    await form_requests_repo.attach_job(request_id=request_record.id, job_id=job.id)
    run_job.delay(str(job.id), {"query": payload.query})
    return CreateFormRequestResponse(request=request_with_job, job=job)
```

**Step 4: Run test to verify it passes**

Run: `cd /home/ika/repos/sentra-v2/sentra-backend && uv run --extra dev python -m pytest tests/api/test_form_requests_api_contract.py tests/unit/api/routes/test_form_requests_owner_scope.py -q`
Expected: PASS.

**Step 5: Commit**

```bash
git -C /home/ika/repos/sentra-v2/sentra-backend add \
  src/sentra_api/api/routes/form_requests.py \
  src/sentra_api/api/v1/router.py \
  src/sentra_api/repositories/jobs_repo.py \
  tests/api/test_form_requests_api_contract.py \
  tests/unit/api/routes/test_form_requests_owner_scope.py
git -C /home/ika/repos/sentra-v2/sentra-backend commit -m "feat: add form request endpoints with linked job creation"
```

### Task 4: Backend OpenAPI And Contract Sync

**Files:**
- Modify: `sentra-backend/openapi/sentra-openapi.yaml`
- Test: `sentra-backend/tests/api/test_openapi_file_sync.py`

**Step 1: Write the failing test**

```python
def test_openapi_includes_form_requests_paths() -> None:
    runtime = app.openapi()
    assert "/v1/form-requests" in runtime["paths"]
    assert "/v1/form-requests/{request_id}" in runtime["paths"]
```

**Step 2: Run test to verify it fails**

Run: `cd /home/ika/repos/sentra-v2/sentra-backend && uv run --extra dev python -m pytest tests/api/test_openapi_file_sync.py -q`
Expected: FAIL until exported spec is updated.

**Step 3: Write minimal implementation**

Run export command:

```bash
cd /home/ika/repos/sentra-v2/sentra-backend
uv run python scripts/export_openapi.py > openapi/sentra-openapi.yaml
```

**Step 4: Run test to verify it passes**

Run: `cd /home/ika/repos/sentra-v2/sentra-backend && uv run --extra dev python -m pytest tests/api/test_openapi_contract.py tests/api/test_openapi_file_sync.py -q`
Expected: PASS.

**Step 5: Commit**

```bash
git -C /home/ika/repos/sentra-v2/sentra-backend add \
  openapi/sentra-openapi.yaml \
  tests/api/test_openapi_file_sync.py
git -C /home/ika/repos/sentra-v2/sentra-backend commit -m "chore: sync openapi with form request endpoints"
```

### Task 5: Frontend Form Request Types And API Client

**Files:**
- Create: `sentra-frontend/src/features/sentra/types/formRequest.ts`
- Create: `sentra-frontend/src/features/sentra/api/formRequests.ts`
- Test: `sentra-frontend/src/features/sentra/__tests__/form-requests-api.test.ts`

**Step 1: Write the failing test**

```ts
it('posts form request payload and returns linked job', async () => {
  vi.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify({
    request: { id: 'r1', query: 'q', status: 'submitted', job_id: 'j1' },
    job: { id: 'j1', query: 'q', status: 'queued' },
  }), { status: 201, headers: { 'Content-Type': 'application/json' } }));

  const result = await createFormRequest({ query: 'q', form_payload: { organization_name: 'Acme' } });
  expect(result.request.id).toBe('r1');
  expect(result.job.id).toBe('j1');
});
```

**Step 2: Run test to verify it fails**

Run: `cd /home/ika/repos/sentra-v2/sentra-frontend && npm run test:run -- src/features/sentra/__tests__/form-requests-api.test.ts`
Expected: FAIL (API module missing).

**Step 3: Write minimal implementation**

```ts
export async function createFormRequest(payload: CreateFormRequestInput): Promise<CreateFormRequestRecord> {
  const response = await apiFetch('/v1/form-requests', { method: 'POST', body: JSON.stringify(payload) });
  if (!response.ok) throw new Error(await parseError(response));
  return (await response.json()) as CreateFormRequestRecord;
}
```

**Step 4: Run test to verify it passes**

Run: `cd /home/ika/repos/sentra-v2/sentra-frontend && npm run test:run -- src/features/sentra/__tests__/form-requests-api.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git -C /home/ika/repos/sentra-v2/sentra-frontend add \
  src/features/sentra/types/formRequest.ts \
  src/features/sentra/api/formRequests.ts \
  src/features/sentra/__tests__/form-requests-api.test.ts
git -C /home/ika/repos/sentra-v2/sentra-frontend commit -m "feat: add frontend form request api client"
```

### Task 6: Frontend Deterministic Query Builder

**Files:**
- Create: `sentra-frontend/src/features/sentra/lib/requestQueryBuilder.ts`
- Test: `sentra-frontend/src/features/sentra/__tests__/request-query-builder.test.ts`

**Step 1: Write the failing test**

```ts
it('builds query from entity, objective, geography, and timeframe', () => {
  const query = buildRequestQuery({
    primary_entity: 'Acme Telecom',
    objectives: ['Brand sentiment monitoring', 'Crisis monitoring / early warning'],
    geography: { region: 'Specific country', country: 'Romania' },
    timeframe: { preset: 'Last 7 days' },
    keywords: ['Acme', '#acme'],
  });

  expect(query).toContain('Acme Telecom');
  expect(query).toContain('Romania');
  expect(query).toContain('last 7 days');
});
```

**Step 2: Run test to verify it fails**

Run: `cd /home/ika/repos/sentra-v2/sentra-frontend && npm run test:run -- src/features/sentra/__tests__/request-query-builder.test.ts`
Expected: FAIL (builder missing).

**Step 3: Write minimal implementation**

```ts
export function buildRequestQuery(input: FormRequestPayload): string {
  const entity = input.primary_entity.trim();
  const country = input.geography.country?.trim() || input.geography.region;
  const timeframe = normalizeTimeframe(input.timeframe);
  const objective = input.objectives[0] ?? 'monitoring';
  const keywords = input.keywords.slice(0, 5).join(', ');
  return `${objective} for ${entity} in ${country} over ${timeframe}. Keywords: ${keywords}`.trim();
}
```

**Step 4: Run test to verify it passes**

Run: `cd /home/ika/repos/sentra-v2/sentra-frontend && npm run test:run -- src/features/sentra/__tests__/request-query-builder.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git -C /home/ika/repos/sentra-v2/sentra-frontend add \
  src/features/sentra/lib/requestQueryBuilder.ts \
  src/features/sentra/__tests__/request-query-builder.test.ts
git -C /home/ika/repos/sentra-v2/sentra-frontend commit -m "feat: add deterministic query builder for form requests"
```

### Task 7: Frontend Request Form Page (`/request-form`)

**Files:**
- Create: `sentra-frontend/src/features/sentra/components/requests/RequestFormPage.tsx`
- Modify: `sentra-frontend/src/App.tsx`
- Test: `sentra-frontend/src/features/sentra/__tests__/request-form-page.test.tsx`
- Test: `sentra-frontend/src/features/sentra/__tests__/routes-smoke.test.tsx`

**Step 1: Write the failing test**

```tsx
it('validates required fields and submits form request', async () => {
  render(<RequestFormPage />);

  await user.click(screen.getByRole('button', { name: /submit request/i }));
  expect(screen.getByText(/organization\/client name is required/i)).toBeInTheDocument();

  await user.type(screen.getByLabelText(/organization \/ client name/i), 'Acme');
  await user.type(screen.getByLabelText(/primary brand \/ organization/i), 'Acme Telecom');
  await user.click(screen.getByRole('button', { name: /submit request/i }));

  expect(createFormRequest).toHaveBeenCalled();
});
```

**Step 2: Run test to verify it fails**

Run: `cd /home/ika/repos/sentra-v2/sentra-frontend && npm run test:run -- src/features/sentra/__tests__/request-form-page.test.tsx`
Expected: FAIL (page missing).

**Step 3: Write minimal implementation**

```tsx
export function RequestFormPage() {
  const [payload, setPayload] = useState<FormRequestPayload>(createDefaultPayload());
  const queryPreview = useMemo(() => buildRequestQuery(payload), [payload]);

  const submit = async () => {
    await createFormRequest({ query: queryPreview, form_payload: payload });
    navigate(`/request-history/${created.request.id}`);
  };

  return <form>{/* fields from target_forms spec */}</form>;
}
```

**Step 4: Run test to verify it passes**

Run: `cd /home/ika/repos/sentra-v2/sentra-frontend && npm run test:run -- src/features/sentra/__tests__/request-form-page.test.tsx src/features/sentra/__tests__/routes-smoke.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git -C /home/ika/repos/sentra-v2/sentra-frontend add \
  src/features/sentra/components/requests/RequestFormPage.tsx \
  src/App.tsx \
  src/features/sentra/__tests__/request-form-page.test.tsx \
  src/features/sentra/__tests__/routes-smoke.test.tsx
git -C /home/ika/repos/sentra-v2/sentra-frontend commit -m "feat: add request form page and route"
```

### Task 8: Frontend Separate Request History And Detail Pages

**Files:**
- Create: `sentra-frontend/src/features/sentra/components/requests/RequestHistoryPage.tsx`
- Create: `sentra-frontend/src/features/sentra/components/requests/RequestDetailPage.tsx`
- Modify: `sentra-frontend/src/App.tsx`
- Test: `sentra-frontend/src/features/sentra/__tests__/request-history-page.test.tsx`
- Test: `sentra-frontend/src/features/sentra/__tests__/request-detail-page.test.tsx`

**Step 1: Write the failing test**

```tsx
it('renders only form requests in request history', async () => {
  render(<RequestHistoryPage />);
  expect(await screen.findByText(/form requests/i)).toBeInTheDocument();
  expect(listFormRequests).toHaveBeenCalled();
});
```

**Step 2: Run test to verify it fails**

Run: `cd /home/ika/repos/sentra-v2/sentra-frontend && npm run test:run -- src/features/sentra/__tests__/request-history-page.test.tsx src/features/sentra/__tests__/request-detail-page.test.tsx`
Expected: FAIL (pages missing).

**Step 3: Write minimal implementation**

```tsx
export function RequestHistoryPage() {
  const [items, setItems] = useState<FormRequestRecord[]>([]);
  useEffect(() => { void listFormRequests().then(setItems); }, []);
  return <div>{items.map((item) => <Link to={`/request-history/${item.id}`}>{item.query}</Link>)}</div>;
}
```

```tsx
export function RequestDetailPage() {
  const { requestId } = useParams();
  // load request detail and linked job status
  // render button/link to open shared analysis document context
}
```

**Step 4: Run test to verify it passes**

Run: `cd /home/ika/repos/sentra-v2/sentra-frontend && npm run test:run -- src/features/sentra/__tests__/request-history-page.test.tsx src/features/sentra/__tests__/request-detail-page.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git -C /home/ika/repos/sentra-v2/sentra-frontend add \
  src/features/sentra/components/requests/RequestHistoryPage.tsx \
  src/features/sentra/components/requests/RequestDetailPage.tsx \
  src/App.tsx \
  src/features/sentra/__tests__/request-history-page.test.tsx \
  src/features/sentra/__tests__/request-detail-page.test.tsx
git -C /home/ika/repos/sentra-v2/sentra-frontend commit -m "feat: add separate request history and detail routes"
```

### Task 9: Sidebar/AppShell Separation Guard (Chat Unchanged)

**Files:**
- Modify: `sentra-frontend/src/features/sentra/components/Sidebar.tsx`
- Modify: `sentra-frontend/src/features/sentra/components/AppShell.tsx`
- Test: `sentra-frontend/src/features/sentra/__tests__/sidebar-request-links.test.tsx`
- Test: `sentra-frontend/src/features/sentra/__tests__/investigation-history.test.tsx`

**Step 1: Write the failing test**

```tsx
it('shows links to request form/history without mixing recent chats', () => {
  render(<Sidebar recentChats={[chat]} ... />);
  expect(screen.getByRole('button', { name: /new request form/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /request history/i })).toBeInTheDocument();
  expect(screen.getByText(/recent chats/i)).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `cd /home/ika/repos/sentra-v2/sentra-frontend && npm run test:run -- src/features/sentra/__tests__/sidebar-request-links.test.tsx src/features/sentra/__tests__/investigation-history.test.tsx`
Expected: FAIL (links not present).

**Step 3: Write minimal implementation**

```tsx
<button type="button" onClick={() => go('/request-form')}>New Request Form</button>
<button type="button" onClick={() => go('/request-history')}>Request History</button>
```

Keep chat state handling unchanged for `/chat` paths.

**Step 4: Run test to verify it passes**

Run: `cd /home/ika/repos/sentra-v2/sentra-frontend && npm run test:run -- src/features/sentra/__tests__/sidebar-request-links.test.tsx src/features/sentra/__tests__/investigation-history.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git -C /home/ika/repos/sentra-v2/sentra-frontend add \
  src/features/sentra/components/Sidebar.tsx \
  src/features/sentra/components/AppShell.tsx \
  src/features/sentra/__tests__/sidebar-request-links.test.tsx \
  src/features/sentra/__tests__/investigation-history.test.tsx
git -C /home/ika/repos/sentra-v2/sentra-frontend commit -m "feat: add request navigation while preserving chat history behavior"
```

### Task 10: Shared Analysis Document Influencer Section

**Files:**
- Modify: `sentra-frontend/src/features/sentra/components/AnalysisResultsDocument.tsx`
- Modify: `sentra-frontend/src/features/sentra/__tests__/analysis-results-document-backend.test.tsx`
- Modify: `sentra-backend/tests/unit/services/analysis/test_analysis_document_materializer.py`

**Step 1: Write the failing test**

```tsx
expect(await screen.findByText(/influencer impact analysis/i)).toBeInTheDocument();
```

```python
def test_materializer_includes_influencer_impact_section() -> None:
    payload, _ = materialize_analysis_document(...)
    assert "influencer_impact_analysis" in payload["sections"]
```

**Step 2: Run test to verify it fails**

Run frontend: `cd /home/ika/repos/sentra-v2/sentra-frontend && npm run test:run -- src/features/sentra/__tests__/analysis-results-document-backend.test.tsx`
Run backend: `cd /home/ika/repos/sentra-v2/sentra-backend && uv run --extra dev python -m pytest tests/unit/services/analysis/test_analysis_document_materializer.py -q`
Expected: Frontend FAIL (section not rendered).

**Step 3: Write minimal implementation**

```tsx
const SECTION_DEFS = [
  // ...
  { key: 'influencer_impact_analysis', title: 'Influencer Impact Analysis' },
  // ...
] as const;

function renderInfluencerImpact(section: Record<string, unknown>): ReactNode {
  const influencers = asObjectList(section.influencers);
  return <QuoteList rows={influencers} emptyMessage="No influencer data available." />;
}
```

**Step 4: Run test to verify it passes**

Run frontend: `cd /home/ika/repos/sentra-v2/sentra-frontend && npm run test:run -- src/features/sentra/__tests__/analysis-results-document-backend.test.tsx`
Run backend: `cd /home/ika/repos/sentra-v2/sentra-backend && uv run --extra dev python -m pytest tests/unit/services/analysis/test_analysis_document_materializer.py -q`
Expected: PASS.

**Step 5: Commit**

```bash
git -C /home/ika/repos/sentra-v2/sentra-frontend add \
  src/features/sentra/components/AnalysisResultsDocument.tsx \
  src/features/sentra/__tests__/analysis-results-document-backend.test.tsx
git -C /home/ika/repos/sentra-v2/sentra-frontend commit -m "feat: render influencer impact section in analysis document"

git -C /home/ika/repos/sentra-v2/sentra-backend add \
  tests/unit/services/analysis/test_analysis_document_materializer.py
git -C /home/ika/repos/sentra-v2/sentra-backend commit -m "test: assert influencer section in analysis document payload"
```

### Task 11: Final Regression And Docs Verification

**Files:**
- Modify (if needed): `sentra-frontend/README.md`
- Modify (if needed): `sentra-backend/README.md`

**Step 1: Write the failing test/checklist entry**

```md
- [ ] /chat still supports conversation proposal-confirm flow
- [ ] /request-form creates job and redirects to request detail
- [ ] /request-history does not show chat conversations
```

**Step 2: Run verification commands**

Run backend targeted suite:
`cd /home/ika/repos/sentra-v2/sentra-backend && uv run --extra dev python -m pytest tests/api/test_form_requests_api_contract.py tests/unit/api/routes/test_form_requests_owner_scope.py tests/api/test_jobs_api_contract.py tests/api/test_openapi_file_sync.py -q`

Run frontend targeted suite:
`cd /home/ika/repos/sentra-v2/sentra-frontend && npm run test:run -- src/features/sentra/__tests__/request-form-page.test.tsx src/features/sentra/__tests__/request-history-page.test.tsx src/features/sentra/__tests__/request-detail-page.test.tsx src/features/sentra/__tests__/routes-smoke.test.tsx src/features/sentra/__tests__/analysis-results-document-backend.test.tsx`

Expected: PASS.

**Step 3: Minimal documentation updates**

```md
# sentra-frontend/README.md
- Added routes: /request-form, /request-history, /request-history/:requestId

# sentra-backend/README.md
- Added endpoints: POST/GET /v1/form-requests and GET /v1/form-requests/{request_id}
```

**Step 4: Re-run verification**

Run same test commands from Step 2.
Expected: PASS.

**Step 5: Commit**

```bash
git -C /home/ika/repos/sentra-v2/sentra-frontend add README.md
git -C /home/ika/repos/sentra-v2/sentra-frontend commit -m "docs: document request-form routes"

git -C /home/ika/repos/sentra-v2/sentra-backend add README.md
git -C /home/ika/repos/sentra-v2/sentra-backend commit -m "docs: document form-request endpoints"
```
