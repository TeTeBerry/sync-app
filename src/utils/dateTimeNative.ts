/** Lightweight date/time helpers without dayjs (main-tab bundle). */

export function parseIsoDate(iso: string): Date | null {
  const trimmed = iso.trim();
  if (!trimmed) return null;
  const ms = Date.parse(trimmed);
  if (Number.isNaN(ms)) return null;
  return new Date(ms);
}

export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function formatClockFromMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function formatAbsoluteDateTime(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${y}/${m}/${d} ${hh}:${mm}`;
}

export function formatCompactCalendarDate(date: Date, now: Date): string {
  if (now.getFullYear() === date.getFullYear()) {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

export type FormatTimeAgoOptions = {
  absoluteAfterHours?: number;
};

export function formatTimeAgoNative(
  iso: string,
  options?: FormatTimeAgoOptions,
): string {
  const date = parseIsoDate(iso);
  if (!date) return '';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
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

const CLOCK_SEGMENT_RE = /\d{1,2}:\d{2}/;

export function formatClockTimeNative(raw: string, maxFallbackLength = 32): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const segment = trimmed.match(CLOCK_SEGMENT_RE)?.[0] ?? trimmed;
  const match = segment.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return trimmed.slice(0, maxFallbackLength);
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return trimmed.slice(0, maxFallbackLength);
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function parseClockToMinutesNative(time: string): number {
  const clock = formatClockTimeNative(time);
  const match = clock.match(/^(\d{2}):(\d{2})$/);
  if (!match) return 0;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function formatMinutesAsClockNative(totalMinutes: number): string {
  return formatClockFromMinutes(totalMinutes);
}

export function formatPostPublishTimeNative(
  iso: string,
  nowMs: number = Date.now(),
): string {
  const date = parseIsoDate(iso);
  if (!date) return '';

  const now = new Date(nowMs);
  const dayDiff = Math.floor(
    (startOfLocalDay(now).getTime() - startOfLocalDay(date).getTime()) / 86_400_000,
  );

  if (dayDiff < 0) return formatCompactCalendarDate(date, now);

  if (dayDiff === 0) {
    const diffMs = now.getTime() - date.getTime();
    const minutes = Math.floor(diffMs / 60_000);
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes} 分钟前`;
    const hours = Math.floor(minutes / 60);
    return `${hours} 小时前`;
  }

  if (dayDiff === 1) {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `昨天 ${hh}:${mm}`;
  }

  if (dayDiff >= 2 && dayDiff < 7) return `${dayDiff} 天前`;

  return formatCompactCalendarDate(date, now);
}
