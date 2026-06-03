import { broadcastCacheData, setCacheData } from '../hooks/useApiQuery';
import { resolveRequestUserId } from '../api/requestContext';
import type { AppNotification } from '../types/backend';

export function notificationListQueryKey(userId?: string) {
  return ['notifications', 'list', userId ?? resolveRequestUserId()] as const;
}

export function notificationUnreadQueryKey(userId?: string) {
  return ['notifications', 'unread', userId ?? resolveRequestUserId()] as const;
}

function patchNotificationList(
  userId: string,
  updater: (list: AppNotification[]) => AppNotification[],
) {
  setCacheData<AppNotification[]>([...notificationListQueryKey(userId)], (prev) => {
    if (!prev?.length) return prev;
    return updater(prev);
  });
  broadcastCacheData(['notifications']);
}

function patchUnreadCount(
  userId: string,
  updater: (count: number | undefined) => number | undefined,
) {
  setCacheData<number>([...notificationUnreadQueryKey(userId)], updater);
  broadcastCacheData(['notifications']);
}

export function markNotificationReadInCache(id: string, userId?: string): boolean {
  const uid = userId ?? resolveRequestUserId();
  let markedUnread = false;
  patchNotificationList(uid, (list) =>
    list.map((item) => {
      if (item.id !== id || item.read) return item;
      markedUnread = true;
      return { ...item, read: true };
    }),
  );
  if (markedUnread) {
    patchUnreadCount(uid, (count) =>
      count !== undefined ? Math.max(0, count - 1) : count,
    );
  }
  return markedUnread;
}

export function markAllNotificationsReadInCache(userId?: string): void {
  const uid = userId ?? resolveRequestUserId();
  patchNotificationList(uid, (list) =>
    list.map((item) => (item.read ? item : { ...item, read: true })),
  );
  patchUnreadCount(uid, () => 0);
}

export function removeNotificationFromCache(id: string, userId?: string): boolean {
  const uid = userId ?? resolveRequestUserId();
  let removedUnread = false;
  patchNotificationList(uid, (list) => {
    const target = list.find((item) => item.id === id);
    if (target && !target.read) removedUnread = true;
    return list.filter((item) => item.id !== id);
  });
  if (removedUnread) {
    patchUnreadCount(uid, (count) =>
      count !== undefined ? Math.max(0, count - 1) : count,
    );
  }
  return removedUnread;
}

export function clearNotificationsInCache(userId?: string): void {
  const uid = userId ?? resolveRequestUserId();
  patchNotificationList(uid, () => []);
  patchUnreadCount(uid, () => 0);
}
