import { describe, expect, it } from 'vitest';
import { buildSingleTurnUserMessage } from './aiChatHistory';

describe('buildSingleTurnUserMessage', () => {
  it('returns only the current user line', () => {
    expect(buildSingleTurnUserMessage('找组队')).toEqual([
      { role: 'user', content: '找组队' },
    ]);
  });

  it('includes image context when provided', () => {
    expect(buildSingleTurnUserMessage('看图', 'wxfile://tmp')).toEqual([
      {
        role: 'user',
        content: '看图',
        imageContext: { source: 'wxfile://tmp' },
      },
    ]);
  });

  it('returns empty when no text or image', () => {
    expect(buildSingleTurnUserMessage('   ')).toEqual([]);
  });
});
