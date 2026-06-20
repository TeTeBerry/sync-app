import { describe, expect, it } from 'vitest';
import { shouldStaleBackgroundRefetch } from '@/hooks/useStaleBackgroundRefetch';

describe('shouldStaleBackgroundRefetch', () => {
  it('allows refetch when cache is stale and min interval elapsed', () => {
    const now = 120_000;
    expect(shouldStaleBackgroundRefetch(now, 0, 0, 60_000, 30_000)).toBe(true);
  });

  it('skips refetch when cache is still fresh', () => {
    const now = 120_000;
    expect(shouldStaleBackgroundRefetch(now, now - 1_000, 0, 60_000, 0)).toBe(false);
  });

  it('skips refetch within min interval', () => {
    const now = 120_000;
    expect(shouldStaleBackgroundRefetch(now, 0, now - 5_000, 60_000, 30_000)).toBe(
      false,
    );
  });
});
