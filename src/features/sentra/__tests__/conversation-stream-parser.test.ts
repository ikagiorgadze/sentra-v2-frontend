import { describe, expect, it } from 'vitest';

import { parseSseChunksForTest } from '@/features/sentra/api/conversationStream';

describe('conversation stream parser', () => {
  it('parses assistant_token and turn_complete events in order', () => {
    const events = parseSseChunksForTest([
      'event: turn_start\ndata: {"conversation_id":"1"}\n\n',
      'event: assistant_token\ndata: {"delta":"Hel"}\n\n',
      'event: assistant_token\ndata: {"delta":"lo"}\n\n',
      'event: turn_complete\ndata: {"assistant_message_id":"m1"}\n\n',
    ]);

    expect(events.map((event) => event.event)).toEqual([
      'turn_start',
      'assistant_token',
      'assistant_token',
      'turn_complete',
    ]);
    expect(events[1]?.payload.delta).toBe('Hel');
    expect(events[2]?.payload.delta).toBe('lo');
  });
});
