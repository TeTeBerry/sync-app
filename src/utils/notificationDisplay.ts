import type { AppNotification, NotificationMeta } from '../types/backend';
import { formatTimeAgo } from './dayTime';

export type NotificationCategory = 'comment' | 'like' | 'system' | 'general';

export function getNotificationCategory(meta?: NotificationMeta): NotificationCategory {
  const type = meta?.type;
  if (type === 'like') return 'like';
  if (type === 'comment' || type === 'comment_reply') return 'comment';
  if (
    type === 'activity_update' ||
    type === 'post_rejected' ||
    type === 'post_hidden' ||
    type === 'activity'
  ) {
    return 'system';
  }
  return 'general';
}

export function resolveNotificationText(item: AppNotification): {
  title: string;
  body: string;
  category: NotificationCategory;
} {
  const category = getNotificationCategory(item.meta);
  return {
    title: item.title,
    body: item.body,
    category,
  };
}

export function formatNotificationTimeAgo(iso: string): string {
  return formatTimeAgo(iso);
}
