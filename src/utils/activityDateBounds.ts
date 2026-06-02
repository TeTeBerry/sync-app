/** 从活动 date 字段解析默认日历范围（如 06/13-14/2026、6月13日-14日） */

export type ActivityDateBounds = {
  year: number;
  month: number;
  dayStart: number;
  dayEnd: number;
};

export function parseActivityDateBounds(
  activityDate?: string,
): ActivityDateBounds | null {
  const raw = activityDate?.trim();
  if (!raw) return null;

  const yearMatch = raw.match(/(20\d{2})/);
  const year = yearMatch ? Number(yearMatch[1]) : new Date().getFullYear();

  const range = raw.match(/(\d{1,2})[./月](\d{1,2})\s*[-–~至]\s*(\d{1,2})/);
  if (range) {
    const month = Number(range[1]);
    const dayStart = Number(range[2]);
    const dayEnd = Number(range[3]);
    if (
      Number.isFinite(month) &&
      Number.isFinite(dayStart) &&
      Number.isFinite(dayEnd) &&
      month >= 1 &&
      month <= 12
    ) {
      return { year, month, dayStart, dayEnd: Math.max(dayStart, dayEnd) };
    }
  }

  const single = raw.match(/(\d{1,2})[./月](\d{1,2})/);
  if (single) {
    const month = Number(single[1]);
    const day = Number(single[2]);
    if (Number.isFinite(month) && Number.isFinite(day) && month >= 1 && month <= 12) {
      return { year, month, dayStart: day, dayEnd: day };
    }
  }

  return null;
}

export function boundsToIsoDate(bounds: ActivityDateBounds, day: number): string {
  const m = String(bounds.month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${bounds.year}-${m}-${d}`;
}

export function formatBuddyPostDateRange(dateStart: string, dateEnd: string): string {
  const start = parseIsoDateParts(dateStart);
  const end = parseIsoDateParts(dateEnd);
  if (!start) return dateStart;
  if (!end || (start.month === end.month && start.day === end.day)) {
    return `${start.month}月${start.day}日`;
  }
  if (start.month === end.month) {
    return `${start.month}月${start.day}日-${end.day}日`;
  }
  return `${start.month}月${start.day}日-${end.month}月${end.day}日`;
}

function parseIsoDateParts(iso: string): { month: number; day: number } | null {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return { month: Number(m[2]), day: Number(m[3]) };
}
