import dayjs from 'dayjs';
import { parseDate } from './dayTime';

/** Compact calendar label for event-detail submeta (fits beside city on one line). */
function formatCompactPostDate(date: dayjs.Dayjs, now: dayjs.Dayjs): string {
  if (now.year() === date.year()) {
    return date.format('M月D日');
  }
  return date.format('YYYY年M月D日');
}

/**
 * Event-detail / map post publish time.
 * Calendar-aware relative labels; compact date when older than a week.
 */
export function formatPostPublishTime(iso: string, nowMs: number = Date.now()): string {
  const date = parseDate(iso);
  if (!date) return '';

  const now = dayjs(nowMs);
  const dayDiff = now.startOf('day').diff(date.startOf('day'), 'day');

  if (dayDiff < 0) return formatCompactPostDate(date, now);

  if (dayDiff === 0) {
    const diffMs = now.diff(date);
    const minutes = Math.floor(diffMs / 60_000);
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes} 分钟前`;
    const hours = Math.floor(minutes / 60);
    return `${hours} 小时前`;
  }

  if (dayDiff === 1) return `昨天 ${date.format('HH:mm')}`;
  if (dayDiff >= 2 && dayDiff < 7) return `${dayDiff} 天前`;

  return formatCompactPostDate(date, now);
}
