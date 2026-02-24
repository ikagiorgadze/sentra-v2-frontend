import { describe, expect, it } from 'vitest';

import { parseSseChunksForTest } from '@/features/sentra/api/conversationStream';

describe('conversation stream parser', () => {
  it('parses token and turn_end events in order', () => {
    const events = parseSseChunksForTest([
      'event: turn_start\ndata: {"conversation_id":"1"}\n\n',
      'event: token\ndata: {"delta":"Hel"}\n\n',
      'event: token\ndata: {"delta":"lo"}\n\n',
      'event: turn_end\ndata: {"assistant_message_id":"m1"}\n\n',
    ]);

    expect(events.map((event) => event.event)).toEqual(['turn_start', 'token', 'token', 'turn_end']);
    expect(events[1]?.payload.delta).toBe('Hel');
    expect(events[2]?.payload.delta).toBe('lo');
  });
});

