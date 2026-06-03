import type { AppNotification, NotificationInteractionType } from '../types/backend';
import { formatTimeAgo } from './dayTime';

/** UI tab categories — aligned with backend NotificationCategory (except buddy_recommend). */
export type NotificationCategory =
  | 'comment'
  | 'like'
  | 'application'
  | 'system'
  | 'general';

export type NotificationMetaCategory = NotificationCategory | 'buddy_recommend';

const UI_CATEGORIES = new Set<NotificationCategory>([
  'comment',
  'like',
  'application',
  'system',
  'general',
]);

/** Same rules as backend `categoryForInteractionType`. */
export function categoryFromInteractionType(
  type?: NotificationInteractionType,
): NotificationCategory {
  switch (type) {
    case 'like':
      return 'like';
    case 'comment':
    case 'comment_reply':
      return 'comment';
    case 'application':
    case 'team_dissolved':
    case 'team_accepted':
      return 'application';
    case 'activity_update':
    case 'post_rejected':
    case 'post_hidden':
    case 'activity':
      return 'system';
    case 'match_recommendation':
      return 'general';
    default:
      return 'general';
  }
}

function normalizeStoredCategory(
  category?: NotificationMetaCategory,
): NotificationCategory | undefined {
  if (!category) return undefined;
  if (category === 'buddy_recommend') return 'general';
  if (UI_CATEGORIES.has(category)) return category;
  return undefined;
}

/**
 * Resolve list-tab category: prefer meta.type (business kind), reconcile legacy
 * meta.category mismatches (e.g. application stored as comment).
 */
export function getNotificationCategory(
  meta?: AppNotification['meta'],
): NotificationCategory {
  const fromType = categoryFromInteractionType(meta?.type);
  const fromCategory = normalizeStoredCategory(
    meta?.category as NotificationMetaCategory | undefined,
  );

  if (meta?.type) {
    if (
      fromCategory &&
      fromCategory !== fromType &&
      (fromType === 'application' || fromCategory === 'comment')
    ) {
      return fromType;
    }
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
