import { formatPostPublishTimeNative } from './dateTimeNative';

/**
 * Event-detail / map post publish time.
 * Calendar-aware relative labels; compact date when older than a week.
 */
export function formatPostPublishTime(iso: string, nowMs: number = Date.now()): string {
  return formatPostPublishTimeNative(iso, nowMs);
}
