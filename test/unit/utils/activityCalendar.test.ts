import { describe, expect, it } from 'vitest';
import {
  activityDayKey,
  activityOccursOnDay,
  buildActivityDaySet,
  expandActivityToDayKeys,
  filterActivitiesInCalendarMonth,
  isCalendarDayBeforeToday,
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

  it('filters activities in a calendar month', () => {
    const activities = [
      { date: '06/13-14', title: '风暴电音节 深圳站 2026' },
      { date: '10/03-04', title: 'EDC Korea 2026' },
    ];
    const june = filterActivitiesInCalendarMonth(activities, 2026, 6);
    expect(june).toHaveLength(1);
    expect(june[0].title).toContain('风暴');
  });

  it('activityOccursOnDay matches a single festival day', () => {
    const activity = { date: '06/13-14', title: '风暴电音节 深圳站 2026' };
    expect(activityOccursOnDay(activity, 2026, 6, 13)).toBe(true);
    expect(activityOccursOnDay(activity, 2026, 6, 15)).toBe(false);
  });

  it('isCalendarDayBeforeToday compares calendar dates only', () => {
    const today = { year: 2026, month: 6, day: 15 };
    expect(isCalendarDayBeforeToday({ year: 2026, month: 6, day: 14 }, today)).toBe(
      true,
    );
    expect(isCalendarDayBeforeToday({ year: 2026, month: 6, day: 15 }, today)).toBe(
      false,
    );
  });
});
