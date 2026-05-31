import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  LONG_RUNNING_REQUEST_TIMEOUT_MS,
} from "../utils/apiClient";
import { uploadImageFile } from "../utils/uploadImage";
import type { ChatSessionRecord } from "../types/aiChat";
import type {
  ActivityRegistrationResult,
  ActivityUnregisterResult,
  AppNotification,
  BackendActivity,
  CreatePostPayload,
  CurrentUser,
  EventDetailPost,
  EventPostsPage,
  HomeFeedPost,
  PostCommentItem,
  HomeSummary,
  PostActionResult,
  ProfileActivityItem,
  ProfilePostItem,
  ProfileSummary,
  PackageCatalog,
  EventPackageEntitlement,
  PurchaseProfilePackagePayload,
  PurchaseProfilePackageResult,
  ConsumeProfileEntitlementPayload,
  ConsumeProfileEntitlementResult,
  BlockListResult,
  ReportPayload,
  ReportResult,
  LiveInfoSnapshot,
  GenerateItineraryPayload,
  GenerateItineraryResult,
  ItineraryScheduleSnapshot,
  SaveItineraryPayload,
  SaveItineraryResult,
  SavedItineraryResult,
  PublishLiveInfoPayload,
  SubmitLiveInfoWristbandPayload,
  SubmitLiveInfoWristbandResult,
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
  return apiGet<HomeSummary>("/home", ownerParams());
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
  return apiPost<{ ok: true }>(
    "/users/blocks",
    { blockedUserId },
    ownerParams(),
  );
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

export type FetchPostsByActivityPageOptions = {
  limit?: number;
  cursor?: string;
  anchorPostId?: string;
};

export function fetchPostsByActivityPage(
  activityLegacyId: number,
  options?: FetchPostsByActivityPageOptions,
) {
  const params: Record<string, string> = {
    activityLegacyId: String(activityLegacyId),
    ...ownerParams(),
  };
  if (options?.limit != null) {
    params.limit = String(options.limit);
  }
  if (options?.cursor) {
    params.cursor = options.cursor;
  }
  if (options?.anchorPostId) {
    params.anchorPostId = options.anchorPostId;
  }
  return apiGet<EventPostsPage>("/posts", params);
}

/** First page only — for lightweight consumers (e.g. event map sheet). */
export async function fetchPostsByActivity(activityLegacyId: number) {
  const page = await fetchPostsByActivityPage(activityLegacyId, { limit: 20 });
  return page.items;
}

export function fetchProfileSummary(activityLegacyId?: number) {
  const params: Record<string, string> = { ...ownerParams() };
  if (activityLegacyId != null && !Number.isNaN(activityLegacyId)) {
    params.activityLegacyId = String(activityLegacyId);
  }
  return apiGet<ProfileSummary>("/profile", params);
}

export function fetchProfilePackages() {
  return apiGet<PackageCatalog>("/profile/packages", ownerParams());
}

export function fetchProfileEntitlements(activityLegacyId?: number) {
  const params: Record<string, string> = { ...ownerParams() };
  if (activityLegacyId != null && !Number.isNaN(activityLegacyId)) {
    params.activityLegacyId = String(activityLegacyId);
  }
  return apiGet<EventPackageEntitlement[]>("/profile/entitlements", params);
}

export function purchaseProfilePackage(payload: PurchaseProfilePackagePayload) {
  return apiPost<PurchaseProfilePackageResult>(
    "/profile/packages/purchase",
    payload,
    ownerParams(),
  );
}

export function consumeProfileAiMatch(payload: ConsumeProfileEntitlementPayload) {
  return apiPost<ConsumeProfileEntitlementResult>(
    "/profile/entitlements/consume/ai-match",
    payload,
    ownerParams(),
  );
}

export function consumeProfileContactUnlock(
  payload: ConsumeProfileEntitlementPayload,
) {
  return apiPost<ConsumeProfileEntitlementResult>(
    "/profile/entitlements/consume/contact-unlock",
    payload,
    ownerParams(),
  );
}

export function fetchProfileActivities() {
  return apiGet<ProfileActivityItem[]>("/profile/activities", ownerParams());
}

export function fetchProfilePosts() {
  return apiGet<ProfilePostItem[]>("/profile/posts", ownerParams());
}

/** 指定用户的个人页帖子（地图用户弹层等） */
export function fetchUserPosts(ownerUserId: string, ownerAuthorName?: string) {
  const params: Record<string, string> = { userId: ownerUserId.trim() };
  const name = ownerAuthorName?.trim();
  if (name) {
    params.authorName = name;
  }
  return apiGet<ProfilePostItem[]>("/profile/posts", params);
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
  return apiPost<PostActionResult>(
    `/posts/${postId}/applications`,
    {},
    ownerParams(),
  );
}

export function fetchPostComments(postId: string) {
  return apiGet<PostCommentItem[]>(`/posts/${postId}/comments`);
}

export function addPostComment(
  postId: string,
  body: string,
  parentCommentId?: string,
) {
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
  return apiDelete<{ ok: true; sessionId: string }>(
    `/chat/sessions/${sessionId}`,
  );
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

export function fetchLiveInfoSnapshot(activityLegacyId: number) {
  return apiGet<LiveInfoSnapshot>(
    `/activities/${activityLegacyId}/live-info`,
    ownerParams(),
  );
}

export function uploadImage(filePath: string) {
  return uploadImageFile(filePath);
}

export function submitLiveInfoWristband(
  activityLegacyId: number,
  payload: SubmitLiveInfoWristbandPayload,
) {
  return apiPost<SubmitLiveInfoWristbandResult>(
    `/activities/${activityLegacyId}/live-info/wristband`,
    payload,
    ownerParams(),
  );
}

export function clearLiveInfoWristband(activityLegacyId: number) {
  return apiDelete<{ ok: true; viewer: LiveInfoSnapshot["viewer"] }>(
    `/activities/${activityLegacyId}/live-info/wristband`,
    ownerParams(),
  );
}

export function publishLiveInfoUpdate(
  activityLegacyId: number,
  payload: PublishLiveInfoPayload,
) {
  return apiPost<{ ok: true; update: LiveInfoSnapshot["feed"][number] }>(
    `/activities/${activityLegacyId}/live-info/updates`,
    payload,
    ownerParams(),
  );
}

export function toggleLiveInfoUpdateLike(
  activityLegacyId: number,
  updateId: string,
) {
  return apiPost<{ ok: true; update: LiveInfoSnapshot["feed"][number] }>(
    `/activities/${activityLegacyId}/live-info/updates/${updateId}/like`,
    {},
    ownerParams(),
  );
}

export function fetchItinerarySchedule(
  activityLegacyId: number,
  options?: { dateKey?: string; selectedDjIds?: string[] },
) {
  const params: Record<string, string> = { ...ownerParams() };
  if (options?.dateKey) params.dateKey = options.dateKey;
  if (options?.selectedDjIds?.length) {
    params.selectedDjIds = options.selectedDjIds.join(",");
  }
  return apiGet<ItineraryScheduleSnapshot>(
    `/activities/${activityLegacyId}/itinerary/schedule`,
    params,
  );
}

export function generateItinerary(
  activityLegacyId: number,
  payload: GenerateItineraryPayload,
) {
  return apiPost<GenerateItineraryResult>(
    `/activities/${activityLegacyId}/itinerary/generate`,
    payload,
    ownerParams(),
    {
      timeoutMs: LONG_RUNNING_REQUEST_TIMEOUT_MS,
      maxRetries: 0,
    },
  );
}

export function saveItinerary(
  activityLegacyId: number,
  payload: SaveItineraryPayload,
) {
  return apiPost<SaveItineraryResult>(
    `/activities/${activityLegacyId}/itinerary/save`,
    payload,
    ownerParams(),
  );
}

export function fetchSavedItinerary(activityLegacyId: number) {
  return apiGet<SavedItineraryResult>(
    `/activities/${activityLegacyId}/itinerary/saved`,
    ownerParams(),
  );
}
