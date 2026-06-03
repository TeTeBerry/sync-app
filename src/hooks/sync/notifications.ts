import {
  clearAllNotifications,
  deleteNotification,
  fetchNotificationUnreadCount,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../api/sync/notifications';
import { resolveRequestUserId } from '../../api/requestContext';
import { isLiveApi } from '../../constants/api';
import type { AppNotification } from '../../types/backend';
import { invalidateNotifications } from '../../utils/queryInvalidation';
import { broadcastCacheData, setCacheData, useApiQuery } from '../useApiQuery';
import type { QueryEnableOptions } from './types';

export async function invalidateNotificationQueries() {
  return invalidateNotifications();
}

function notificationListKey(userId: string) {
  return ['notifications', 'list', userId] as const;
}

function notificationUnreadKey(userId: string) {
  return ['notifications', 'unread', userId] as const;
}

function patchNotificationList(
  userId: string,
  updater: (list: AppNotification[]) => AppNotification[],
) {
  setCacheData<AppNotification[]>([...notificationListKey(userId)], (prev) => {
    if (!prev?.length) return prev;
    return updater(prev);
  });
  broadcastCacheData(['notifications']);
}

function patchUnreadCount(
  userId: string,
  updater: (count: number | undefined) => number | undefined,
) {
  setCacheData<number>([...notificationUnreadKey(userId)], updater);
  broadcastCacheData(['notifications']);
}

export function useNotificationsQuery() {
  const enabled = isLiveApi();
  const userId = resolveRequestUserId();

  return useApiQuery({
    queryKey: ['notifications', 'list', userId],
    queryFn: () => fetchNotifications(),
    enabled,
    staleTime: 30_000,
  });
}

export function useNotificationUnreadCount(options?: QueryEnableOptions) {
  const tabEnabled = options?.enabled ?? true;
  const enabled = isLiveApi() && tabEnabled;
  const userId = resolveRequestUserId();

  return useApiQuery({
    queryKey: ['notifications', 'unread', userId],
    queryFn: () => fetchNotificationUnreadCount(),
    enabled,
    staleTime: 30_000,
  });
}

export async function markNotificationAsRead(id: string) {
  const userId = resolveRequestUserId();
  let markedUnread = false;
  patchNotificationList(userId, (list) =>
    list.map((item) => {
      if (item.id !== id || item.read) return item;
      markedUnread = true;
      return { ...item, read: true };
    }),
  );
  if (markedUnread) {
    patchUnreadCount(userId, (count) =>
      count !== undefined ? Math.max(0, count - 1) : count,
    );
  }

  await markNotificationRead(id);
  await invalidateNotificationQueries();
}

export async function markAllNotificationsAsRead() {
  const userId = resolveRequestUserId();
  patchNotificationList(userId, (list) =>
    list.map((item) => (item.read ? item : { ...item, read: true })),
  );
  patchUnreadCount(userId, () => 0);

  await markAllNotificationsRead();
  await invalidateNotificationQueries();
}

export async function deleteNotificationAndInvalidate(id: string) {
  const userId = resolveRequestUserId();
  let removedUnread = false;
  patchNotificationList(userId, (list) => {
    const target = list.find((item) => item.id === id);
    if (target && !target.read) removedUnread = true;
    return list.filter((item) => item.id !== id);
  });
  if (removedUnread) {
    patchUnreadCount(userId, (count) =>
      count !== undefined ? Math.max(0, count - 1) : count,
    );
  }

  await deleteNotification(id);
  await invalidateNotificationQueries();
}

export async function clearAllNotificationsAndInvalidate() {
  const userId = resolveRequestUserId();
  patchNotificationList(userId, () => []);
  patchUnreadCount(userId, () => 0);

  await clearAllNotifications();
  await invalidateNotificationQueries();
}
