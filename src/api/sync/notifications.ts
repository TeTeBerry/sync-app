import { apiDelete, apiGet, apiPatch } from '../../utils/apiClient';
import type { AppNotification } from '../../types/backend';

export function fetchNotifications(userId?: string) {
  return apiGet<AppNotification[]>('/notifications', { userId });
}

export function fetchNotificationUnreadCount(userId?: string) {
  return apiGet<number>('/notifications/unread-count', { userId });
}

export function markNotificationRead(id: string, userId?: string) {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
  return apiPatch<AppNotification>(`/notifications/${id}/read${query}`, {});
}

export function markAllNotificationsRead(userId?: string) {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
  return apiPatch<{ ok: true }>(`/notifications/read-all${query}`, {});
}

export function deleteNotification(id: string, userId?: string) {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
  return apiDelete<{ ok: true }>(`/notifications/${id}${query}`);
}

export function clearAllNotifications(userId?: string) {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
  return apiDelete<{ ok: true }>(`/notifications${query}`);
}
