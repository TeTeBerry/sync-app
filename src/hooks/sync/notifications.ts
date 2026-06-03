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
import { invalidateNotifications } from '../../utils/queryInvalidation';
import { useApiQuery } from '../useApiQuery';
import type { QueryEnableOptions } from './types';

export async function invalidateNotificationQueries() {
  return invalidateNotifications();
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
  await markNotificationRead(id);
  await invalidateNotificationQueries();
}

export async function markAllNotificationsAsRead() {
  await markAllNotificationsRead();
  await invalidateNotificationQueries();
}

export async function deleteNotificationAndInvalidate(id: string) {
  await deleteNotification(id);
  await invalidateNotificationQueries();
}

export async function clearAllNotificationsAndInvalidate() {
  await clearAllNotifications();
  await invalidateNotificationQueries();
}
