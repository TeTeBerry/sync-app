import { describe, expect, it } from 'vitest';
import { AUTH_SESSION_EXPIRED_MESSAGE } from '@/constants/authMessages';
import { shouldClearSessionOnWsError } from '@/utils/wsAuthError';

describe('shouldClearSessionOnWsError', () => {
  it('returns true for session expired message', () => {
    expect(shouldClearSessionOnWsError(AUTH_SESSION_EXPIRED_MESSAGE)).toBe(true);
  });

  it('returns false for other errors', () => {
    expect(shouldClearSessionOnWsError('上一条消息仍在处理中')).toBe(false);
    expect(shouldClearSessionOnWsError(undefined)).toBe(false);
  });
});
