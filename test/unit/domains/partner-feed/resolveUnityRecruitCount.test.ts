import { describe, expect, it } from 'vitest';
import { resolveUnityRecruitCount } from '@/domains/partner-feed/utils/resolveUnityRecruitCount';

describe('resolveUnityRecruitCount', () => {
  it('uses catalog count while feed is loading', () => {
    expect(resolveUnityRecruitCount(12, 1, false)).toBe(12);
    expect(resolveUnityRecruitCount(undefined, 3, false)).toBe(0);
  });

  it('prefers loaded feed count when catalog is stale', () => {
    expect(resolveUnityRecruitCount(0, 1, true)).toBe(1);
    expect(resolveUnityRecruitCount(0, 5, true)).toBe(5);
  });

  it('prefers catalog count when feed has more pages', () => {
    expect(resolveUnityRecruitCount(13, 10, true, true)).toBe(13);
  });
});
