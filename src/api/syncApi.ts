import { apiGet, apiPatch, apiPost } from "../utils/apiClient";
import type { ChatSessionRecord } from "../types/aiChat";
import type { AppNotification, BackendActivity, HomeSummary } from "../types/backend";

export function fetchActivities() {
  return apiGet<BackendActivity[]>("/activities");
}

export function matchActivity(keyword: string) {
  return apiGet<BackendActivity | null>("/activities/match", { keyword });
}

export function fetchHomeSummary() {
  return apiGet<HomeSummary>("/home");
}

export function fetchActivityByLegacyId(legacyId: number) {
  return apiGet<BackendActivity | null>(`/activities/${legacyId}`);
}

export function fetchChatSession(sessionId: string) {
  return apiGet<ChatSessionRecord>(`/chat/sessions/${sessionId}`);
}

export function fetchNotifications(userId?: string) {
  return apiGet<AppNotification[]>("/notifications", { userId });
}

export function fetchNotificationUnreadCount(userId?: string) {
  return apiGet<number>("/notifications/unread-count", { userId });
}

export function markNotificationRead(id: string, userId?: string) {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  return apiPatch<AppNotification>(`/notifications/${id}/read${query}`, {});
}

export function markAllNotificationsRead(userId?: string) {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  return apiPatch<{ ok: true }>(`/notifications/read-all${query}`, {});
}
