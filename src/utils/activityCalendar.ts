import { extractYearFromText, parseActivityDateRange } from './activityStatus';

export type ActivityCalendarFields = {
  date?: string;
  title?: string;
};

export type CalendarMonthCell =
  | { kind: 'empty'; key: string }
  | { kind: 'day'; key: string; year: number; month: number; day: number };

export function activityDayKey(year: number, month: number, day: number): string {
  return `${year}-${month}-${day}`;
}

export function parseActivityDayKey(key: string): {
  year: number;
  month: number;
  day: number;
} | null {
  const match = key.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

/** Expand catalog date strings to every calendar day in range. */
export function expandActivityToDayKeys(date: string, title?: string): string[] {
  const yearHint =
    extractYearFromText(title) ??
    extractYearFromText(date) ??
    String(new Date().getFullYear());
  const range = parseActivityDateRange(date, yearHint);
  if (!range) return [];

  const keys: string[] = [];
  const cursor = new Date(range.start);
  const end = range.end.getTime();

  while (cursor.getTime() <= end) {
    keys.push(
      activityDayKey(cursor.getFullYear(), cursor.getMonth() + 1, cursor.getDate()),
    );
    cursor.setDate(cursor.getDate() + 1);
  }

  return keys;
}

export function buildActivityDaySet(activities: ActivityCalendarFields[]): Set<string> {
  const set = new Set<string>();
  for (const activity of activities) {
    const date = activity.date?.trim();
    if (!date) continue;
    for (const key of expandActivityToDayKeys(date, activity.title)) {
      set.add(key);
    }
  }
  return set;
}

export function buildMonthGrid(year: number, month: number): CalendarMonthCell[] {
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: CalendarMonthCell[] = [];

  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push({ kind: 'empty', key: `pad-start-${i}` });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      kind: 'day',
      key: activityDayKey(year, month, day),
      year,
      month,
      day,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ kind: 'empty', key: `pad-end-${cells.length}` });
  }

  return cells;
}

export const CALENDAR_WEEKDAY_LABELS = [
  '日',
  '一',
  '二',
  '三',
  '四',
  '五',
  '六',
] as const;

export function formatCalendarMonthLabel(year: number, month: number): string {
  return `${year}年 ${month}月`;
}

export function shiftCalendarMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const date = new Date(year, month - 1 + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export function isSameCalendarDay(
  a: { year: number; month: number; day: number },
  b: { year: number; month: number; day: number },
): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

export function todayCalendarParts(): { year: number; month: number; day: number } {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
}

export function activityOccursOnDay(
  activity: ActivityCalendarFields,
  year: number,
  month: number,
  day: number,
): boolean {
  const date = activity.date?.trim();
  if (!date) return false;
  const key = activityDayKey(year, month, day);
  return expandActivityToDayKeys(date, activity.title).includes(key);
}

export function activityOccursInMonth(
  activity: ActivityCalendarFields,
  year: number,
  month: number,
): boolean {
  const date = activity.date?.trim();
  if (!date) return false;
  return expandActivityToDayKeys(date, activity.title).some((key) => {
    const parsed = parseActivityDayKey(key);
    return parsed?.year === year && parsed.month === month;
  });
}

export function filterActivitiesInCalendarMonth<T extends ActivityCalendarFields>(
  activities: T[],
  year: number,
  month: number,
): T[] {
  return activities.filter((activity) => activityOccursInMonth(activity, year, month));
}

export function isCalendarDayBeforeToday(
  day: { year: number; month: number; day: number },
  today = todayCalendarParts(),
): boolean {
  const target = new Date(day.year, day.month - 1, day.day).getTime();
  const current = new Date(today.year, today.month - 1, today.day).getTime();
  return target < current;
}
