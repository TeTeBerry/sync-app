import { describe, expect, it } from 'vitest';
import { buildSingleTurnUserMessage } from '@/utils/aiChatHistory';

describe('buildSingleTurnUserMessage', () => {
  it('returns only the current user line', () => {
    expect(buildSingleTurnUserMessage('组队')).toEqual([
      { role: 'user', content: '组队' },
    ]);
  });

  it('returns empty when no text', () => {
    expect(buildSingleTurnUserMessage('   ')).toEqual([]);
  });
});
