import { describe, expect, it } from 'vitest';
import { ApiAbortError, isApiAbortError } from '@/utils/apiAbortError';

describe('isApiAbortError', () => {
  it('detects ApiAbortError instances', () => {
    expect(isApiAbortError(new ApiAbortError())).toBe(true);
  });

  it('detects WeChat request abort messages', () => {
    expect(isApiAbortError(new Error('request:fail abort'))).toBe(true);
    expect(isApiAbortError({ errMsg: 'request:fail abort' })).toBe(true);
    expect(
      isApiAbortError(new Error('MiniProgramError {"errMsg":"request:fail abort"}')),
    ).toBe(true);
  });

  it('does not treat normal failures as abort', () => {
    expect(isApiAbortError(new Error('request:fail timeout'))).toBe(false);
  });
});
