import { afterEach, describe, expect, it, vi } from 'vitest';

describe('formatAiChatStreamError', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('masks quota exhausted errors when profile benefits are disabled', async () => {
    vi.stubEnv('TARO_APP_ENABLE_PROFILE_BENEFITS', undefined);
    const { formatAiChatStreamError } = await import('@/utils/aiChatErrors');
    expect(
      formatAiChatStreamError(new Error('AI match quota exhausted'), '发送失败'),
    ).toBe('发送失败');
  });

  it('keeps quota exhausted errors when profile benefits are enabled', async () => {
    vi.stubEnv('TARO_APP_ENABLE_PROFILE_BENEFITS', 'true');
    const { formatAiChatStreamError } = await import('@/utils/aiChatErrors');
    expect(
      formatAiChatStreamError(new Error('AI match quota exhausted'), '发送失败'),
    ).toBe('AI match quota exhausted');
  });
});
