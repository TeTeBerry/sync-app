import { describe, expect, it } from 'vitest';
import {
  boundsToIsoDate,
  formatBuddyPostDateRange,
  parseActivityDateBounds,
} from './activityDateBounds';

describe('activityDateBounds', () => {
  it('parses activity date range', () => {
    const bounds = parseActivityDateBounds('06/13-14/2026');
    expect(bounds).toEqual({
      year: 2026,
      month: 6,
      dayStart: 13,
      dayEnd: 14,
    });
    expect(boundsToIsoDate(bounds!, 13)).toBe('2026-06-13');
  });

  it('formats display range', () => {
    expect(formatBuddyPostDateRange('2026-06-13', '2026-06-14')).toBe('6月13日-14日');
  });
});
