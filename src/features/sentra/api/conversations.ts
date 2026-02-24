import { apiFetch } from '@/lib/api/http';
import type {
  ConfirmConversationJobInput,
  ConfirmConversationJobRecord,
  ConversationMessageRecord,
  ConversationRecord,
  ConversationSnapshotRecord,
  ConversationTurnRecord,
} from '@/features/sentra/types/conversation';

interface ConversationsListResponse {
  items: ConversationRecord[];
  next_cursor?: string | null;
}

interface ConversationMessagesResponse {
  items: ConversationMessageRecord[];
}

async function parseError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { detail?: string };
    if (payload.detail) {
      return payload.detail;
    }
  } catch {
    // no-op
  }

  return response.statusText || 'Request failed';
}

export async function createConversation(title?: string): Promise<ConversationRecord> {
  const response = await apiFetch('/v1/conversations', {
    method: 'POST',
    body: JSON.stringify(title ? { title } : {}),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as ConversationRecord;
}

export async function listConversations(): Promise<ConversationRecord[]> {
  const response = await apiFetch('/v1/conversations');

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const payload = (await response.json()) as ConversationsListResponse;
  return payload.items ?? [];
}

export async function getConversation(conversationId: string): Promise<ConversationRecord> {
  const response = await apiFetch(`/v1/conversations/${conversationId}`);

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as ConversationRecord;
}

export async function getConversationSnapshot(conversationId: string): Promise<ConversationSnapshotRecord> {
  const response = await apiFetch(`/v1/conversations/${conversationId}/snapshot`);

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as ConversationSnapshotRecord;
}

export async function listConversationMessages(conversationId: string): Promise<ConversationMessageRecord[]> {
  const response = await apiFetch(`/v1/conversations/${conversationId}/messages`);

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const payload = (await response.json()) as ConversationMessagesResponse;
  return payload.items ?? [];
}

export async function postConversationMessage(
  conversationId: string,
  content: string,
): Promise<ConversationTurnRecord> {
  const response = await apiFetch(`/v1/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as ConversationTurnRecord;
}

export async function confirmConversationJob(
  conversationId: string,
  payload: ConfirmConversationJobInput,
): Promise<ConfirmConversationJobRecord> {
  const response = await apiFetch(`/v1/conversations/${conversationId}/confirm-job`, {
    method: 'POST',
    body: JSON.stringify({
      proposal_version: payload.proposalVersion,
      idempotency_key: payload.idempotencyKey,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as ConfirmConversationJobRecord;
}
