import type { AppNotification, NotificationInteractionType } from '../types/backend';
import { formatTimeAgo } from './dayTime';

/** UI tab categories — aligned with backend NotificationCategory. */
export type NotificationCategory = 'system' | 'general';

const UI_CATEGORIES = new Set<NotificationCategory>(['system', 'general']);

const DEPRECATED_APPLICATION_TYPES = new Set<string>([
  'application',
  'team_dissolved',
  'team_accepted',
]);

const DEPRECATED_POST_INTERACTION_TYPES = new Set<string>([
  'like',
  'comment',
  'comment_reply',
]);

const DEPRECATED_POST_INTERACTION_CATEGORIES = new Set<string>(['like', 'comment']);

const DEPRECATED_TEMPLATE_KEY_RE = /notifications\.types\.(like|comment|commentReply)/;

/** Legacy team-apply notifications — hidden from the inbox. */
export function isDeprecatedApplicationNotification(
  meta?: AppNotification['meta'],
): boolean {
  if (!meta) return false;
  if ((meta.category as string | undefined) === 'application') return true;
  return meta.type != null && DEPRECATED_APPLICATION_TYPES.has(meta.type);
}

export function isDeprecatedPostInteractionNotification(
  meta?: AppNotification['meta'],
): boolean {
  if (!meta) return false;
  if (meta.category && DEPRECATED_POST_INTERACTION_CATEGORIES.has(meta.category)) {
    return true;
  }
  if (meta.type && DEPRECATED_POST_INTERACTION_TYPES.has(meta.type)) {
    return true;
  }
  const templateKey = meta.templateKey?.trim() ?? '';
  return DEPRECATED_TEMPLATE_KEY_RE.test(templateKey);
}

export function isHiddenNotification(meta?: AppNotification['meta']): boolean {
  return (
    isDeprecatedApplicationNotification(meta) ||
    isDeprecatedPostInteractionNotification(meta)
  );
}

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
    default:
      return 'general';
  }
}

function normalizeStoredCategory(
  category?: NotificationCategory | 'buddy_recommend' | 'like' | 'comment',
): NotificationCategory | undefined {
  if (!category) return undefined;
  if (category === 'buddy_recommend' || category === 'like' || category === 'comment') {
    return 'general';
  }
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
    meta?.category as
      | NotificationCategory
      | 'buddy_recommend'
      | 'like'
      | 'comment'
      | undefined,
  );

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
