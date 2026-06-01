import { formatTimeAgo } from './dayTime';

/** Event-detail post publish time: relative within 24h, absolute datetime after. */
export function formatPostPublishTime(iso: string): string {
  return formatTimeAgo(iso, { absoluteAfterHours: 24 });
}
