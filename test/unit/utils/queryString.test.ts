import { describe, expect, it } from 'vitest';
import { decodeQueryParamValue } from '@/utils/queryString';

describe('decodeQueryParamValue', () => {
  it('decodes percent-encoded Chinese departure labels', () => {
    expect(decodeQueryParamValue('%E6%85%A7%E6%99%BA%C2%B7%E4%BB%81%E6%81%92')).toBe(
      '慧智·仁恒',
    );
  });

  it('leaves plain text unchanged', () => {
    expect(decodeQueryParamValue('上海')).toBe('上海');
  });
});
