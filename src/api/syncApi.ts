import { apiDelete, apiGet, apiPatch, apiPost } from "../utils/apiClient";
import type { ChatSessionRecord } from "../types/aiChat";
import type {
  ActivityRegistrationResult,
  ActivityUnregisterResult,
  AppNotification,
  BackendActivity,
  CreatePostPayload,
  CurrentUser,
  EventDetailPost,
  HomeFeedPost,
  PostCommentItem,
  HomeSummary,
  PostActionResult,
  ProfileActivityItem,
  ProfilePostItem,
  ProfileSummary,
  BlockListResult,
  ReportPayload,
  ReportResult,
  UpdateCurrentUserPayload,
  UpdatePostPayload,
} from "../types/backend";
import { ownerParams } from "../utils/session";

export function fetchActivities() {
  return apiGet<BackendActivity[]>("/activities");
}

export function matchActivity(keyword: string) {
  return apiGet<BackendActivity | null>("/activities/match", { keyword });
}

export function fetchHomeSummary() {
  // eslint-disable-next-line no-console
  console.log("[syncApi] fetchHomeSummary called");
  const result = apiGet<HomeSummary>("/home", ownerParams());
  // eslint-disable-next-line no-console
  console.log("[syncApi] fetchHomeSummary returned promise");
  return result;
}

export function fetchActivityByLegacyId(legacyId: number) {
  return apiGet<BackendActivity | null>(`/activities/${legacyId}`);
}

export function registerForActivity(legacyId: number) {
  return apiPost<ActivityRegistrationResult>(
    `/activities/${legacyId}/register`,
    {},
    ownerParams(),
  );
}

export function cancelActivityRegistration(legacyId: number) {
  return apiDelete<ActivityUnregisterResult>(
    `/activities/${legacyId}/register`,
    ownerParams(),
  );
}

export function fetchCurrentUser() {
  return apiGet<CurrentUser>("/users/me", ownerParams());
}

export function updateCurrentUser(payload: UpdateCurrentUserPayload) {
  return apiPatch<CurrentUser>("/users/me", payload, ownerParams());
}

export function fetchBlockedUserIds() {
  return apiGet<BlockListResult>("/users/blocks", ownerParams());
}

export function blockUser(blockedUserId: string) {
  return apiPost<{ ok: true }>("/users/blocks", { blockedUserId }, ownerParams());
}

export function unblockUser(blockedUserId: string) {
  return apiDelete<{ ok: true }>(
    `/users/blocks/${encodeURIComponent(blockedUserId)}`,
    ownerParams(),
  );
}

export function submitReport(payload: ReportPayload) {
  return apiPost<ReportResult>("/reports", payload, ownerParams());
}

export function fetchPopularPosts(limit = 20) {
  return apiGet<HomeFeedPost[]>("/posts/popular", {
    limit: String(limit),
    ...ownerParams(),
  });
}

export function fetchAllPosts() {
  return apiGet<HomeFeedPost[]>("/posts/all", ownerParams());
}

export function fetchPostsByActivity(activityLegacyId: number) {
  return apiGet<EventDetailPost[]>("/posts", {
    activityLegacyId: String(activityLegacyId),
    ...ownerParams(),
  });
}

export function fetchProfileSummary() {
  return apiGet<ProfileSummary>("/profile", ownerParams());
}

export function fetchProfileActivities() {
  return apiGet<ProfileActivityItem[]>("/profile/activities", ownerParams());
}

export function fetchProfilePosts() {
  return apiGet<ProfilePostItem[]>("/profile/posts", ownerParams());
}

export function deletePost(postId: string) {
  return apiDelete<{ ok: true }>(`/posts/${postId}`, ownerParams());
}

export function createPost(payload: CreatePostPayload) {
  return apiPost<EventDetailPost>("/posts", payload, ownerParams());
}

export function updatePost(postId: string, payload: UpdatePostPayload) {
  return apiPatch<ProfilePostItem>(`/posts/${postId}`, payload, ownerParams());
}

export function likePost(postId: string) {
  return apiPost<EventDetailPost>(`/posts/${postId}/like`, {}, ownerParams());
}

export function applyToPost(postId: string) {
  return apiPost<PostActionResult>(`/posts/${postId}/applications`, {}, ownerParams());
}

export function fetchPostComments(postId: string) {
  return apiGet<PostCommentItem[]>(`/posts/${postId}/comments`);
}

export function addPostComment(postId: string, body: string, parentCommentId?: string) {
  return apiPost<EventDetailPost>(
    `/posts/${postId}/comments`,
    { body, ...(parentCommentId ? { parentCommentId } : {}) },
    ownerParams(),
  );
}

export function fetchChatSession(sessionId: string) {
  return apiGet<ChatSessionRecord>(`/chat/sessions/${sessionId}`);
}

export function clearChatSession(sessionId: string) {
  return apiDelete<{ ok: true; sessionId: string }>(`/chat/sessions/${sessionId}`);
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

export function deleteNotification(id: string, userId?: string) {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  return apiDelete<{ ok: true }>(`/notifications/${id}${query}`);
}

export function clearAllNotifications(userId?: string) {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  return apiDelete<{ ok: true }>(`/notifications${query}`);
}
