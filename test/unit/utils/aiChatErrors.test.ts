import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatAiChatStreamError } from '@/utils/aiChatErrors';

describe('formatAiChatStreamError', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns fallback when message is empty', () => {
    expect(formatAiChatStreamError(new Error('   '), '发送失败')).toBe('发送失败');
  });

  it('returns error message in non-production', () => {
    expect(
      formatAiChatStreamError(new Error('AI match quota exhausted'), '发送失败'),
    ).toBe('AI match quota exhausted');
  });
});
