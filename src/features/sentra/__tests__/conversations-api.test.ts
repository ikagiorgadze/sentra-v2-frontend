import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  confirmConversationJob,
  createConversation,
  deleteConversation,
  postConversationMessage,
} from '@/features/sentra/api/conversations';

const NOW = '2026-02-23T20:00:00Z';

describe('conversations api', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a conversation', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          id: '20d6f6d2-8105-4f20-8151-2bdadf7a9a31',
          user_id: '11111111-1111-1111-1111-111111111111',
          title: null,
          state: 'collecting_intent',
          active_proposal_version: 0,
          inserted_at: NOW,
          updated_at: NOW,
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const conversation = await createConversation();

    expect(conversation.id).toBe('20d6f6d2-8105-4f20-8151-2bdadf7a9a31');
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('/v1/conversations');
  });

  it('posts a message and returns assistant turn payload', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          conversation: {
            id: '20d6f6d2-8105-4f20-8151-2bdadf7a9a31',
            user_id: '11111111-1111-1111-1111-111111111111',
            title: null,
            state: 'awaiting_confirmation',
            active_proposal_version: 1,
            inserted_at: NOW,
            updated_at: NOW,
          },
          assistant_message: {
            id: '3b15995c-fcbf-4d84-966d-eecf4e5393ac',
            conversation_id: '20d6f6d2-8105-4f20-8151-2bdadf7a9a31',
            role: 'assistant',
            content: 'Please confirm this query before I create the job.',
            inserted_at: NOW,
            updated_at: NOW,
          },
          pending_proposal: {
            id: 'b8f80a2a-5662-4268-a4b7-9886f7262dcf',
            conversation_id: '20d6f6d2-8105-4f20-8151-2bdadf7a9a31',
            version: 1,
            normalized_query: 'Sentiment around pension reform in Romania last 7 days',
            filters_json: { country: 'Romania', time_range: '7d' },
            status: 'pending',
            inserted_at: NOW,
            updated_at: NOW,
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const turn = await postConversationMessage(
      '20d6f6d2-8105-4f20-8151-2bdadf7a9a31',
      'Track pension reform sentiment in Romania for the last 7 days',
    );

    expect(turn.assistant_message.role).toBe('assistant');
    expect(turn.pending_proposal?.version).toBe(1);
  });

  it('confirms a proposal and returns linked job', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          conversation_id: '20d6f6d2-8105-4f20-8151-2bdadf7a9a31',
          proposal_id: 'b8f80a2a-5662-4268-a4b7-9886f7262dcf',
          job_id: '120d6e13-9f74-42bb-9fff-395a7f4f5f00',
          status: 'queued',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const confirmed = await confirmConversationJob('20d6f6d2-8105-4f20-8151-2bdadf7a9a31', {
      proposalVersion: 1,
      idempotencyKey: 'idemp-1',
      collectionPlanOverrides: {
        min_confidence: 70,
      },
    });

    expect(confirmed.job_id).toBe('120d6e13-9f74-42bb-9fff-395a7f4f5f00');
    expect(confirmed.status).toBe('queued');
    const request = fetchMock.mock.calls[0]?.[1];
    const sentBody = JSON.parse(String(request?.body ?? '{}')) as Record<string, unknown>;
    expect(sentBody.collection_plan_overrides).toEqual(
      expect.objectContaining({ min_confidence: 70 }),
    );
  });

  it('sends use_existing confirm action payload when selecting a completed job', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          conversation_id: '20d6f6d2-8105-4f20-8151-2bdadf7a9a31',
          proposal_id: 'b8f80a2a-5662-4268-a4b7-9886f7262dcf',
          job_id: '120d6e13-9f74-42bb-9fff-395a7f4f5f00',
          status: 'completed',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    await confirmConversationJob('20d6f6d2-8105-4f20-8151-2bdadf7a9a31', {
      proposalVersion: 1,
      idempotencyKey: 'idemp-2',
      action: 'useExisting',
      selectedJobId: '120d6e13-9f74-42bb-9fff-395a7f4f5f00',
    });

    const request = fetchMock.mock.calls[0]?.[1];
    const sentBody = JSON.parse(String(request?.body ?? '{}')) as Record<string, unknown>;
    expect(sentBody.action).toBe('use_existing');
    expect(sentBody.selected_job_id).toBe('120d6e13-9f74-42bb-9fff-395a7f4f5f00');
  });

  it('throws backend detail when posting a message fails', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ detail: 'provider timeout' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(postConversationMessage('20d6f6d2-8105-4f20-8151-2bdadf7a9a31', 'hello')).rejects.toThrow(
      'provider timeout',
    );
  });

  it('deletes a conversation', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(new Response(null, { status: 204 }));

    await deleteConversation('20d6f6d2-8105-4f20-8151-2bdadf7a9a31');

    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('/v1/conversations/20d6f6d2-8105-4f20-8151-2bdadf7a9a31');
    const request = fetchMock.mock.calls[0]?.[1];
    expect(request?.method).toBe('DELETE');
  });

  it('throws backend detail when deleting a conversation fails', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ detail: 'conversation not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(deleteConversation('20d6f6d2-8105-4f20-8151-2bdadf7a9a31')).rejects.toThrow(
      'conversation not found',
    );
  });
});
