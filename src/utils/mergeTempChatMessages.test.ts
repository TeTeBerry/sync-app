import { describe, expect, it } from 'vitest';
import { mergeTempChatMessages } from './mergeTempChatMessages';
import type { TempChatMessage } from '../types/tempChat';

const base = (id: string, at: string): TempChatMessage => ({
  id,
  sessionId: 's1',
  role: 'peer',
  body: `body-${id}`,
  createdAt: at,
});

describe('mergeTempChatMessages', () => {
  it('returns incoming when prev is empty', () => {
    const incoming = [base('a', '2026-01-01T10:00:00.000Z')];
    expect(mergeTempChatMessages([], incoming)).toEqual(incoming);
  });

  it('keeps prev reference when incoming is unchanged', () => {
    const prev = [
      base('a', '2026-01-01T10:00:00.000Z'),
      base('b', '2026-01-01T10:01:00.000Z'),
    ];
    const incoming = prev.map((message) => ({ ...message }));
    expect(mergeTempChatMessages(prev, incoming)).toBe(prev);
  });

  it('appends only new messages', () => {
    const prev = [base('a', '2026-01-01T10:00:00.000Z')];
    const incoming = [
      ...prev,
      { ...base('b', '2026-01-01T10:01:00.000Z'), role: 'me' as const },
    ];
    const merged = mergeTempChatMessages(prev, incoming);
    expect(merged).toHaveLength(2);
    expect(merged[1]?.id).toBe('b');
    expect(merged).not.toBe(prev);
  });
});
