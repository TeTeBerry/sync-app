import { describe, expect, it } from 'vitest';
import { computeListWindow } from '@/hooks/useWindowedList';

describe('computeListWindow', () => {
  it('returns full loaded range in static mode', () => {
    expect(computeListWindow(false, 0, 10, 12, 3)).toEqual({
      windowStart: 0,
      windowEnd: 10,
    });
  });

  it('caps sliding window size', () => {
    const { windowStart, windowEnd } = computeListWindow(true, 10, 20, 5, 1);
    expect(windowEnd - windowStart).toBeLessThanOrEqual(5);
    expect(windowStart).toBeLessThanOrEqual(10);
    expect(windowEnd).toBeGreaterThan(10);
  });
});
