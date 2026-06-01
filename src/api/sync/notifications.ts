import { notificationQueryParams } from '../requestContext';
import { apiDelete, apiGet, apiPatch } from '../../utils/apiClient';
import type { AppNotification } from '../../types/backend';

export function fetchNotifications() {
  return apiGet<AppNotification[]>('/notifications', notificationQueryParams());
}

export function fetchNotificationUnreadCount() {
  return apiGet<number>('/notifications/unread-count', notificationQueryParams());
}

export function markNotificationRead(id: string) {
  return apiPatch<AppNotification>(
    `/notifications/${id}/read`,
    {},
    notificationQueryParams(),
  );
}

export function markAllNotificationsRead() {
  return apiPatch<{ ok: true }>(
    '/notifications/read-all',
    {},
    notificationQueryParams(),
  );
}

export function deleteNotification(id: string) {
  return apiDelete<{ ok: true }>(`/notifications/${id}`, notificationQueryParams());
}

export function clearAllNotifications() {
  return apiDelete<{ ok: true }>('/notifications', notificationQueryParams());
}
