import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AiChatStreamEvent } from '@/types/aiChat';
import type { PooledConnection } from '@/utils/aiChatWs/pool';

const poolMocks = vi.hoisted(() => ({
  ensureWsPool: vi.fn(),
  sendJson: vi.fn(),
  closeAiChatWsConnection: vi.fn(),
  getWsPool: vi.fn(() => null),
  clearActiveTurn: vi.fn(),
}));

vi.mock('@/utils/aiChatWs/pool', () => poolMocks);

vi.mock('@/utils/aiChatWs/log', () => ({
  devLogWarn: vi.fn(),
  isAiChatWsDevLog: () => false,
}));

vi.mock('@/constants/api', () => ({
  resolveAiChatWsUrl: () => 'ws://test/api/ai/chat/ws',
}));

const { ensureWsPool, sendJson, closeAiChatWsConnection } = poolMocks;

import { streamAiChatWs } from '@/utils/aiChatWs/stream';

function mockConnection(): PooledConnection {
  return {
    wsUrl: 'ws://test/api/ai/chat/ws',
    headersKey: '',
    task: { send: vi.fn() } as never,
    activeTurn: null,
  };
}

async function collectStream(
  options: Parameters<typeof streamAiChatWs>[0],
): Promise<AiChatStreamEvent[]> {
  const events: AiChatStreamEvent[] = [];
  for await (const event of streamAiChatWs(options)) {
    events.push(event);
  }
  return events;
}

describe('streamAiChatWs turn retry', () => {
  let connectCalls = 0;
  let pooled: PooledConnection | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    connectCalls = 0;
    pooled = null;

    ensureWsPool.mockImplementation(async () => {
      connectCalls += 1;
      if (connectCalls === 1) {
        throw new Error('connect failed');
      }
      pooled = mockConnection();
      return pooled;
    });

    sendJson.mockImplementation(async (_task, payload: { type?: string }) => {
      const turn = pooled?.activeTurn;
      if (!turn) return;
      if (payload.type === 'connect') {
        turn.settleConnected('resolve');
        return;
      }
      if (payload.type === 'send') {
        turn.queue.push({ kind: 'event', event: { type: 'done' } });
      }
    });
  });

  it('retries once when the first connect fails before any event', async () => {
    const events = await collectStream({
      url: 'ws://test/api/ai/chat/ws',
      messages: [{ role: 'user', content: 'hi' }],
      sessionId: 'sess-1',
    });

    expect(connectCalls).toBe(2);
    expect(events.some((event) => event.type === 'done')).toBe(true);
    expect(closeAiChatWsConnection).toHaveBeenCalledWith('turn retry');
  });

  it('does not retry after a delta was received', async () => {
    connectCalls = 0;
    ensureWsPool.mockImplementation(async () => {
      connectCalls += 1;
      pooled = mockConnection();
      return pooled;
    });

    sendJson.mockImplementation(async (_task, payload: { type?: string }) => {
      const turn = pooled?.activeTurn;
      if (!turn) return;
      if (payload.type === 'connect') {
        turn.settleConnected('resolve');
        return;
      }
      if (payload.type === 'send') {
        turn.queue.push({ kind: 'event', event: { type: 'delta', content: 'x' } });
        turn.queue.push({ kind: 'error', error: new Error('socket dropped') });
      }
    });

    await expect(
      collectStream({
        url: 'ws://test/api/ai/chat/ws',
        messages: [{ role: 'user', content: 'hello' }],
      }),
    ).rejects.toThrow('socket dropped');

    expect(connectCalls).toBe(1);
  });
});
