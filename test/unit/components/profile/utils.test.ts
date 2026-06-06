import { describe, expect, it } from 'vitest';
import { deriveInterestTag } from '@/components/profile/utils';

describe('deriveInterestTag', () => {
  it('returns null for missing or empty bio', () => {
    expect(deriveInterestTag(undefined)).toBeNull();
    expect(deriveInterestTag(null)).toBeNull();
    expect(deriveInterestTag('   ')).toBeNull();
  });

  it('detects 电音 tag', () => {
    expect(deriveInterestTag('电音爱好者')).toBe('电音');
  });

  it('does not throw when bio is a non-string API value', () => {
    expect(deriveInterestTag(0 as never)).toBeNull();
    expect(deriveInterestTag({} as never)).toBeNull();
  });
});
