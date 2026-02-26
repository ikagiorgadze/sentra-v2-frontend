# Recent Chat Soft Delete Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add owner-scoped soft delete for conversations and expose it in the Recent Chats sidebar with confirmation UX.

**Architecture:** Implement `DELETE /v1/conversations/{conversation_id}` in backend using repository-driven soft deletion across conversation-linked tables. Add frontend API client support, sidebar delete affordance (hover trash + confirm modal), and AppShell orchestration to reset active state when the deleted chat is open. Validate through focused backend + frontend tests and OpenAPI sync.

**Tech Stack:** FastAPI, SQLAlchemy async repository pattern, Vitest + Testing Library, React + TypeScript, existing shadcn/ui components.

---

## Execution Standards
- Follow `@test-driven-development` on every task (red -> green -> refactor).
- For backend tests, apply `@python-testing-patterns` with narrow, deterministic assertions.
- Keep commits small and scoped to each task.

### Task 1: Add Repository Soft-Delete Primitive

**Files:**
- Modify: `../sentra-backend/src/sentra_api/repositories/conversations_repo.py`
- Modify: `../sentra-backend/tests/unit/repositories/test_conversations_repository.py`

**Step 1: Write failing repository tests**

Add tests that verify:
- `soft_delete_conversation()` updates parent + child tables.
- Method commits exactly once on success.
- Method rolls back on SQLAlchemy error.

```python
@pytest.mark.asyncio
async def test_soft_delete_conversation_marks_parent_and_children() -> None:
    ...
    deleted = await repo.soft_delete_conversation(user_id=user_id, conversation_id=conversation_id)
    assert deleted is True
    assert db.committed == 1
    assert any("update conversations" in sql for sql in db.sql_log)
```

**Step 2: Run tests to verify failure**

Run:
```bash
cd /home/ika/repos/sentra-v2/sentra-backend
uv run --extra dev pytest tests/unit/repositories/test_conversations_repository.py -q
```

Expected: FAIL because `soft_delete_conversation` does not exist yet.

**Step 3: Implement minimal repository method**

Add method:
```python
async def soft_delete_conversation(self, *, conversation_id: UUID, user_id: UUID) -> bool:
    ...
```

Behavior:
- Set one shared `now = datetime.now(UTC)`.
- Soft delete `conversations` scoped by `id`, `user_id`, `deleted_at IS NULL`.
- If no parent row updated, rollback and return `False`.
- Soft delete child rows (`conversation_messages`, `conversation_proposals`, `conversation_jobs`, `conversation_tool_runs`) by `conversation_id` and `deleted_at IS NULL`.
- Commit once and return `True`.
- Rollback + raise on `SQLAlchemyError`.

**Step 4: Run tests to verify pass**

Run:
```bash
cd /home/ika/repos/sentra-v2/sentra-backend
uv run --extra dev pytest tests/unit/repositories/test_conversations_repository.py -q
```

Expected: PASS.

**Step 5: Commit**

```bash
cd /home/ika/repos/sentra-v2/sentra-backend
git add src/sentra_api/repositories/conversations_repo.py tests/unit/repositories/test_conversations_repository.py
git commit -m "feat: add conversation soft delete repository primitive"
```

### Task 2: Add Backend Delete Endpoint Contract

**Files:**
- Modify: `../sentra-backend/src/sentra_api/api/routes/conversations.py`
- Modify: `../sentra-backend/tests/api/test_conversations_api_contract.py`

**Step 1: Write failing API contract tests**

Add tests:
- `DELETE /v1/conversations/{id}` returns `204` when owner deletes existing conversation.
- Same endpoint returns `404` when repository reports missing/non-owned conversation.

```python
def test_delete_conversation_returns_204_for_owner(monkeypatch) -> None:
    ...
    response = client.delete(f"/v1/conversations/{conversation_id}", headers=auth_header)
    assert response.status_code == 204
```

**Step 2: Run tests to verify failure**

Run:
```bash
cd /home/ika/repos/sentra-v2/sentra-backend
uv run --extra dev pytest tests/api/test_conversations_api_contract.py -q
```

Expected: FAIL with 405/404 before endpoint implementation.

**Step 3: Implement endpoint**

Add route:
```python
@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(...):
    ...
```

Behavior:
- Resolve `user_id` via `_principal_user_uuid(principal)`.
- Call `repo.soft_delete_conversation(...)`.
- Raise `HTTPException(404, "Conversation not found")` when delete returns `False`.
- Return empty 204 response on success.

**Step 4: Run tests to verify pass**

Run:
```bash
cd /home/ika/repos/sentra-v2/sentra-backend
uv run --extra dev pytest tests/api/test_conversations_api_contract.py -q
```

Expected: PASS.

**Step 5: Commit**

```bash
cd /home/ika/repos/sentra-v2/sentra-backend
git add src/sentra_api/api/routes/conversations.py tests/api/test_conversations_api_contract.py
git commit -m "feat: add owner-scoped conversation delete endpoint"
```

### Task 3: Add Frontend Delete API Client

**Files:**
- Modify: `src/features/sentra/api/conversations.ts`
- Modify: `src/features/sentra/__tests__/conversations-api.test.ts`

**Step 1: Write failing API client test**

Add test:
- `deleteConversation(id)` sends `DELETE` request to `/v1/conversations/{id}`.
- Throws backend `detail` on non-OK responses.

```ts
it('deletes a conversation', async () => {
  const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(new Response(null, { status: 204 }));
  await deleteConversation('20d6f6d2-8105-4f20-8151-2bdadf7a9a31');
  const request = fetchMock.mock.calls[0]?.[1];
  expect(request?.method).toBe('DELETE');
});
```

**Step 2: Run test to verify failure**

Run:
```bash
cd /home/ika/repos/sentra-v2/sentra-frontend
npm run test:run -- src/features/sentra/__tests__/conversations-api.test.ts
```

Expected: FAIL because `deleteConversation` is missing.

**Step 3: Implement client method**

Add:
```ts
export async function deleteConversation(conversationId: string): Promise<void> {
  const response = await apiFetch(`/v1/conversations/${conversationId}`, { method: 'DELETE' });
  if (!response.ok) throw new Error(await parseError(response));
}
```

**Step 4: Run test to verify pass**

Run:
```bash
cd /home/ika/repos/sentra-v2/sentra-frontend
npm run test:run -- src/features/sentra/__tests__/conversations-api.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
cd /home/ika/repos/sentra-v2/sentra-frontend
git add src/features/sentra/api/conversations.ts src/features/sentra/__tests__/conversations-api.test.ts
git commit -m "feat: add frontend conversation delete api client"
```

### Task 4: Add Sidebar Delete UX (Hover Action + Confirm Modal)

**Files:**
- Modify: `src/features/sentra/components/Sidebar.tsx`
- Create: `src/features/sentra/__tests__/sidebar-delete-chat.test.tsx`

**Step 1: Write failing sidebar interaction tests**

Cover:
- Delete action renders for recent chat item.
- Click opens confirm modal.
- Cancel closes modal and does not invoke callback.
- Confirm invokes delete callback with selected chat id.

```tsx
it('opens confirm modal and calls onDeleteChat on confirm', async () => {
  ...
  await user.click(screen.getByRole('button', { name: /delete romania chat/i }));
  await user.click(screen.getByRole('button', { name: /delete chat/i }));
  expect(onDeleteChat).toHaveBeenCalledWith(chatId);
});
```

**Step 2: Run tests to verify failure**

Run:
```bash
cd /home/ika/repos/sentra-v2/sentra-frontend
npm run test:run -- src/features/sentra/__tests__/sidebar-delete-chat.test.tsx src/features/sentra/__tests__/sidebar-admin-demo-link.test.tsx
```

Expected: FAIL because delete UI/props are missing.

**Step 3: Implement Sidebar changes**

Implement:
- New optional props:
  - `onDeleteChat?: (id: string) => void | Promise<void>`
  - `isDeletingChatId?: string | null`
- Row-level trash button (hover-visible) with accessible label including chat title.
- Confirm modal using existing `AlertDialog` components.
- Confirm button disabled when `isDeletingChatId === selectedChatId`.

**Step 4: Run tests to verify pass**

Run:
```bash
cd /home/ika/repos/sentra-v2/sentra-frontend
npm run test:run -- src/features/sentra/__tests__/sidebar-delete-chat.test.tsx src/features/sentra/__tests__/sidebar-admin-demo-link.test.tsx
```

Expected: PASS.

**Step 5: Commit**

```bash
cd /home/ika/repos/sentra-v2/sentra-frontend
git add src/features/sentra/components/Sidebar.tsx src/features/sentra/__tests__/sidebar-delete-chat.test.tsx
git commit -m "feat: add sidebar recent chat delete confirmation ux"
```

### Task 5: Wire Delete Behavior in AppShell

**Files:**
- Modify: `src/features/sentra/components/AppShell.tsx`
- Create: `src/features/sentra/__tests__/recent-chat-delete.test.tsx`

**Step 1: Write failing AppShell behavior tests**

Cover:
- Deleting active chat resets app state (clears messages/query/proposal/current ids).
- Deleting non-active chat keeps current conversation loaded.
- Delete API failure keeps row and surfaces error message.

```tsx
it('resets to idle state when active chat is deleted', async () => {
  ...
  expect(screen.queryByText(/confirm query/i)).not.toBeInTheDocument();
});
```

**Step 2: Run tests to verify failure**

Run:
```bash
cd /home/ika/repos/sentra-v2/sentra-frontend
npm run test:run -- src/features/sentra/__tests__/recent-chat-delete.test.tsx
```

Expected: FAIL before AppShell wiring.

**Step 3: Implement AppShell delete orchestration**

Implement:
- Add `isDeletingChatId` state.
- Add `handleDeleteChat(id)` that:
  - calls `deleteConversation(id)`,
  - refreshes recent chats,
  - if `id === currentChatId`, executes same state reset as `handleNewInvestigation`.
- Pass new props to `<Sidebar ... />`.
- On failure, set `recentChatsError` (or equivalent visible error channel).

**Step 4: Run tests to verify pass**

Run:
```bash
cd /home/ika/repos/sentra-v2/sentra-frontend
npm run test:run -- src/features/sentra/__tests__/recent-chat-delete.test.tsx src/features/sentra/__tests__/recent-chats-hydration.test.tsx src/features/sentra/__tests__/investigation-history.test.tsx
```

Expected: PASS.

**Step 5: Commit**

```bash
cd /home/ika/repos/sentra-v2/sentra-frontend
git add src/features/sentra/components/AppShell.tsx src/features/sentra/__tests__/recent-chat-delete.test.tsx
git commit -m "feat: wire recent chat delete behavior in app shell"
```

### Task 6: OpenAPI and Regression Verification

**Files:**
- Modify: `../sentra-backend/openapi/sentra-openapi.yaml`
- Optional doc touch if needed: `../sentra-backend/README.md` (Db/API usage notes)

**Step 1: Write failing verification (OpenAPI drift)**

Run:
```bash
cd /home/ika/repos/sentra-v2/sentra-backend
uv run --extra dev pytest tests/api/test_openapi_file_sync.py -q
```

Expected: FAIL if endpoint added but OpenAPI file not exported.

**Step 2: Export OpenAPI and verify**

Run:
```bash
cd /home/ika/repos/sentra-v2/sentra-backend
uv run python scripts/export_openapi.py > openapi/sentra-openapi.yaml
uv run --extra dev pytest tests/api/test_openapi_contract.py tests/api/test_openapi_file_sync.py -q
```

Expected: PASS.

**Step 3: Run focused end-to-end regression suite**

Run:
```bash
cd /home/ika/repos/sentra-v2/sentra-backend
uv run --extra dev pytest tests/api/test_conversations_api_contract.py tests/unit/repositories/test_conversations_repository.py -q

cd /home/ika/repos/sentra-v2/sentra-frontend
npm run test:run -- src/features/sentra/__tests__/conversations-api.test.ts src/features/sentra/__tests__/sidebar-delete-chat.test.tsx src/features/sentra/__tests__/recent-chat-delete.test.tsx
```

Expected: PASS.

**Step 4: Commit**

```bash
cd /home/ika/repos/sentra-v2/sentra-backend
git add openapi/sentra-openapi.yaml
git commit -m "docs: sync openapi for conversation delete endpoint"
```
