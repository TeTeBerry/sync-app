import type { AppNotification, NotificationInteractionType } from '../types/backend';
import { formatTimeAgo } from './dayTime';

/** UI tab categories — aligned with backend NotificationCategory. */
export type NotificationCategory = 'system' | 'general';

const UI_CATEGORIES = new Set<NotificationCategory>(['system', 'general']);

/** Same rules as backend `categoryForInteractionType`. */
export function categoryFromInteractionType(
  type?: NotificationInteractionType | string,
): NotificationCategory {
  switch (type) {
    case 'activity_update':
    case 'post_rejected':
    case 'post_hidden':
    case 'activity':
      return 'system';
    case 'comment':
    case 'comment_reply':
      return 'general';
    default:
      return 'general';
  }
}

function normalizeStoredCategory(
  category?: NotificationCategory | string,
): NotificationCategory | undefined {
  if (!category) return undefined;
  if (UI_CATEGORIES.has(category as NotificationCategory)) {
    return category as NotificationCategory;
  }
  return 'general';
}

export function getNotificationCategory(
  meta?: AppNotification['meta'],
): NotificationCategory {
  const fromType = categoryFromInteractionType(meta?.type);
  const fromCategory = normalizeStoredCategory(meta?.category);

  if (meta?.type) {
    return fromType;
  }

  return fromCategory ?? 'general';
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
