import { describe, expect, it } from 'vitest';
import {
  activityDayKey,
  buildActivityDaySet,
  expandActivityToDayKeys,
} from '@/utils/activityCalendar';

describe('activityCalendar', () => {
  it('expands same-month festival ranges', () => {
    expect(expandActivityToDayKeys('06/13-14', '风暴电音节 深圳站 2026')).toEqual([
      activityDayKey(2026, 6, 13),
      activityDayKey(2026, 6, 14),
    ]);
  });

  it('builds a day set from activities', () => {
    const set = buildActivityDaySet([
      { date: '04/18-19', title: '2026横琴VAC电音节' },
      { date: '06/13-14', title: '风暴电音节 深圳站' },
    ]);
    expect(set.has(activityDayKey(2026, 4, 18))).toBe(true);
    expect(set.has(activityDayKey(2026, 6, 13))).toBe(true);
    expect(set.has(activityDayKey(2026, 6, 15))).toBe(false);
  });
});
