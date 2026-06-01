import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const CLOCK_PARSE_FORMATS = ['HH:mm', 'H:mm'] as const;

/** Parse ISO or date string; returns null when invalid. */
export function parseDate(iso: string): dayjs.Dayjs | null {
  const parsed = dayjs(iso);
  return parsed.isValid() ? parsed : null;
}

/**
 * Normalize clock text to HH:mm.
 * Accepts ranges like `20:30-22:00` (uses the first segment).
 */
export function formatClockTime(raw: string, maxFallbackLength = 32): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const segment = trimmed.match(/\d{1,2}:\d{2}/)?.[0] ?? trimmed;
  const parsed = dayjs(segment, [...CLOCK_PARSE_FORMATS], true);
  if (parsed.isValid()) {
    return parsed.format('HH:mm');
  }

  return trimmed.slice(0, maxFallbackLength);
}

/** Minutes from midnight for HH:mm (invalid input → 0). */
export function parseClockToMinutes(time: string): number {
  const clock = formatClockTime(time);
  const parsed = dayjs(clock, 'HH:mm', true);
  if (!parsed.isValid()) return 0;
  return parsed.hour() * 60 + parsed.minute();
}

/** Format minutes from midnight as HH:mm (wraps hours mod 24). */
export function formatMinutesAsClock(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return dayjs().hour(hours).minute(minutes).second(0).millisecond(0).format('HH:mm');
}

export type FormatTimeAgoOptions = {
  /** When set, show absolute datetime after this many hours (e.g. post publish time). */
  absoluteAfterHours?: number;
};

function formatAbsoluteDateTime(date: dayjs.Dayjs): string {
  return date.format('YYYY/MM/DD HH:mm');
}

/** Relative time in Chinese: 刚刚 / N 分钟前 / N 小时前 / N 天前, or absolute datetime. */
export function formatTimeAgo(iso: string, options?: FormatTimeAgoOptions): string {
  const date = parseDate(iso);
  if (!date) return '';

  const diffMs = dayjs().diff(date);
  if (diffMs < 0) return formatAbsoluteDateTime(date);

  const absoluteAfterHours = options?.absoluteAfterHours;
  if (absoluteAfterHours != null && diffMs >= absoluteAfterHours * 3_600_000) {
    return formatAbsoluteDateTime(date);
  }

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;

  const days = Math.floor(hours / 24);
  return `${days} 天前`;
}
