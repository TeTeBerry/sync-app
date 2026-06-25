import { describe, expect, it } from 'vitest';
import { formatPerformanceBundleSavedAt } from '@/domains/activity-info/utils/formatPerformanceBundleSavedAt';

describe('formatPerformanceBundleSavedAt', () => {
  it('formats valid timestamps as MM/DD HH:mm', () => {
    const savedAt = new Date(2026, 5, 25, 9, 5).getTime();
    expect(formatPerformanceBundleSavedAt(savedAt)).toBe('06/25 09:05');
  });

  it('returns empty string for invalid timestamps', () => {
    expect(formatPerformanceBundleSavedAt(Number.NaN)).toBe('');
    expect(formatPerformanceBundleSavedAt(Number.POSITIVE_INFINITY)).toBe('');
  });
});
