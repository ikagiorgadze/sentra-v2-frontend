# Recent Chat Soft Delete Design

**Date:** 2026-02-26  
**Repo:** `sentra-frontend` + `sentra-backend`  
**Status:** Approved

## Goal
Add a safe way for users to delete chats from the Recent Chats sidebar.

## Decisions
- Delete behavior: soft delete
- Trigger: hover trash icon on each recent chat row
- Confirmation: modal confirmation required
- If deleting active chat: reset to fresh empty chat state

## Architecture
Implement conversation deletion end-to-end so behavior is persistent and owner-scoped:
- Backend adds `DELETE /v1/conversations/{conversation_id}`.
- Repository performs transactional soft delete across conversation and conversation-linked rows.
- Frontend adds sidebar row-level delete control + confirm modal.
- On success, frontend refreshes recent chats and resets active state if needed.

This keeps behavior consistent across refreshes/devices and aligns with existing soft-delete model usage.

## Components
### Backend
- Route update in `sentra-backend/src/sentra_api/api/routes/conversations.py`:
  - Add authenticated owner-scoped delete endpoint.
  - Return `204 No Content` on success.
  - Return `404` when conversation is missing or not owned by principal.
- Repository update in `sentra-backend/src/sentra_api/repositories/conversations_repo.py`:
  - Add `soft_delete_conversation(user_id, conversation_id)`.
  - Set `deleted_at` on:
    - `conversations`
    - `conversation_messages`
    - `conversation_proposals`
    - `conversation_jobs`
    - `conversation_tool_runs`
  - Run in one transaction with rollback on failure.

### Frontend
- API client update in `sentra-frontend/src/features/sentra/api/conversations.ts`:
  - Add `deleteConversation(conversationId)` using `DELETE /v1/conversations/{id}`.
- Sidebar UI update in `sentra-frontend/src/features/sentra/components/Sidebar.tsx`:
  - Add hover trash action per chat row.
  - Add confirm modal with Cancel/Delete actions.
  - Disable Delete button while request is in flight.
- State orchestration update in `sentra-frontend/src/features/sentra/components/AppShell.tsx`:
  - Handle delete callback from sidebar.
  - Refresh recent chats on success.
  - If deleted id is current chat, reuse "new investigation" reset path.
  - Show user-facing error on failure.

## Data Flow
1. User clicks trash icon on a recent chat row.
2. Sidebar opens confirmation modal.
3. User confirms delete.
4. Frontend calls backend delete endpoint.
5. Backend verifies owner access and soft deletes conversation + linked rows.
6. Frontend refreshes recent chat list.
7. If deleted chat was active, frontend clears chat context and returns to idle/new state.

## Error Handling
- Backend:
  - `404` for missing/non-owned conversation.
  - Transaction rollback on failures.
- Frontend:
  - Prevent duplicate submits while deleting.
  - Surface error message if delete fails and keep chat list intact.
  - If deletion succeeded but refresh fails, keep local state coherent and expose retry path.
- Concurrency:
  - If already deleted elsewhere, treat `404` as non-fatal and refresh list.

## Testing
### Frontend
- `conversations` API tests:
  - `deleteConversation()` calls correct endpoint and handles error body.
- Sidebar tests:
  - delete icon is available for chat rows.
  - confirmation modal opens/cancels/confirms correctly.
  - in-flight delete disables confirmation action.
- AppShell tests:
  - deleting current chat resets to idle/new state.
  - deleting non-current chat keeps active chat untouched.
  - delete failure shows error and does not remove chat.

### Backend
- API contract tests:
  - owner can delete and gets `204`.
  - missing/non-owned returns `404`.
  - deleted conversation is excluded from list/get/snapshot.
- Repository unit tests:
  - `soft_delete_conversation` updates soft-delete markers for parent and linked rows.
  - commit on success, rollback on failure.
