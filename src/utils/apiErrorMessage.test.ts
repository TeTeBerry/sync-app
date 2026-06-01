import { describe, expect, it } from 'vitest';
import { ApiError } from './apiClient';
import { getApiErrorMessage } from './apiErrorMessage';

describe('getApiErrorMessage', () => {
  it('returns ApiError message when present', () => {
    expect(getApiErrorMessage(new ApiError('你已举报过该内容', 409), '失败')).toBe(
      '你已举报过该内容',
    );
  });

  it('falls back when error has no message', () => {
    expect(getApiErrorMessage(new ApiError('', 500), '举报失败')).toBe('举报失败');
  });

  it('falls back for non-Error values', () => {
    expect(getApiErrorMessage(null, '屏蔽失败')).toBe('屏蔽失败');
  });
});
