import { describe, expect, it } from 'vitest';
import {
  boundsToIsoDate,
  formatBuddyPostDateRange,
  formatBuddyPostDateShort,
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

  it('formats short post body date', () => {
    expect(formatBuddyPostDateShort('2026-06-13', '2026-06-14')).toBe('6.13-6.14');
    expect(formatBuddyPostDateShort('2026-06-13', '2026-06-13')).toBe('6.13');
  });
});
