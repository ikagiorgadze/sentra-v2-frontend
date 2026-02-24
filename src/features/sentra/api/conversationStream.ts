import { apiFetch } from '@/lib/api/http';
import type { ConversationStreamEvent, ConversationStreamEventType } from '@/features/sentra/types/conversation';

interface StreamCallbacks {
  onEvent?: (event: ConversationStreamEvent) => void;
}

function parseEventBlock(block: string): ConversationStreamEvent | null {
  const lines = block
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) {
    return null;
  }

  const eventLine = lines.find((line) => line.startsWith('event:'));
  const dataLines = lines.filter((line) => line.startsWith('data:'));
  if (!eventLine || dataLines.length === 0) {
    return null;
  }

  const event = eventLine.slice('event:'.length).trim() as ConversationStreamEventType;
  const rawData = dataLines.map((line) => line.slice('data:'.length).trim()).join('');
  try {
    const payload = JSON.parse(rawData) as Record<string, unknown>;
    return { event, payload };
  } catch {
    return null;
  }
}

export function parseSseChunksForTest(chunks: string[]): ConversationStreamEvent[] {
  let buffer = '';
  const events: ConversationStreamEvent[] = [];
  for (const chunk of chunks) {
    buffer += chunk;
    const blocks = buffer.split('\n\n');
    buffer = blocks.pop() ?? '';
    for (const block of blocks) {
      const parsed = parseEventBlock(block);
      if (parsed) {
        events.push(parsed);
      }
    }
  }
  return events;
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

export async function streamConversationMessage(
  conversationId: string,
  content: string,
  callbacks: StreamCallbacks,
): Promise<void> {
  const response = await apiFetch(`/v1/conversations/${conversationId}/messages/stream`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  if (!response.body) {
    throw new Error('Streaming response body missing');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split('\n\n');
    buffer = blocks.pop() ?? '';
    for (const block of blocks) {
      const parsed = parseEventBlock(block);
      if (parsed) {
        callbacks.onEvent?.(parsed);
      }
    }
  }
}

