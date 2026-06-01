import {
  clearAllNotifications,
  deleteNotification,
  fetchNotificationUnreadCount,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../api/sync/notifications';
import { resolveRequestUserId } from '../../api/requestContext';
import { isApiEnabled } from '../../constants/api';
import { invalidateNotifications } from '../../utils/queryInvalidation';
import { useApiQuery } from '../useApiQuery';
import type { QueryEnableOptions } from './types';

export async function invalidateNotificationQueries() {
  return invalidateNotifications();
}

export function useNotificationsQuery() {
  const enabled = isApiEnabled();
  const userId = resolveRequestUserId();

  return useApiQuery({
    queryKey: ['notifications', 'list', userId],
    queryFn: () => fetchNotifications(userId),
    enabled,
    staleTime: 30_000,
  });
}

export function useNotificationUnreadCount(options?: QueryEnableOptions) {
  const tabEnabled = options?.enabled ?? true;
  const enabled = isApiEnabled() && tabEnabled;
  const userId = resolveRequestUserId();

  return useApiQuery({
    queryKey: ['notifications', 'unread', userId],
    queryFn: () => fetchNotificationUnreadCount(userId),
    enabled,
    staleTime: 30_000,
  });
}

export async function markNotificationAsRead(id: string) {
  const userId = resolveRequestUserId();
  await markNotificationRead(id, userId);
  await invalidateNotificationQueries();
}

export async function markAllNotificationsAsRead() {
  const userId = resolveRequestUserId();
  await markAllNotificationsRead(userId);
  await invalidateNotificationQueries();
}

export async function deleteNotificationAndInvalidate(id: string) {
  const userId = resolveRequestUserId();
  await deleteNotification(id, userId);
  await invalidateNotificationQueries();
}

export async function clearAllNotificationsAndInvalidate() {
  const userId = resolveRequestUserId();
  await clearAllNotifications(userId);
  await invalidateNotificationQueries();
}
