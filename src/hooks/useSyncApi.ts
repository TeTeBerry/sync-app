import { useMemo } from 'react';
import { useApiQuery } from './useApiQuery';
import {
  addPostComment,
  applyToPost,
  cancelActivityRegistration,
  deletePost,
  fetchActivities,
  fetchActivityByLegacyId,
  fetchCurrentUser,
  fetchHomeSummary,
  fetchNotificationUnreadCount,
  fetchNotifications,
  fetchPopularPosts,
  fetchPostsByActivity,
  fetchPostComments,
  fetchProfileActivities,
  fetchProfileEntitlements,
  fetchProfilePackages,
  fetchProfilePosts,
  fetchProfileSummary,
  purchaseProfilePackage,
  consumeProfileAiMatch,
  consumeProfileContactUnlock,
  likePost,
  clearAllNotifications,
  deleteNotification,
  markAllNotificationsRead,
  markNotificationRead,
  registerForActivity,
  blockUser,
  submitReport,
  updateCurrentUser,
  updatePost,
} from '../api/syncApi';
import type {
  EventDetailPost,
  HomeFeedPost,
  HomeSummary,
  PurchaseProfilePackagePayload,
  ReportPayload,
  UpdateCurrentUserPayload,
} from '../types/backend';
import { isApiEnabled } from '../constants/api';
import { getClientUserId } from '../utils/session';
import { seedActivityDetailsFromList } from '../utils/activityDetailCache';
import {
  HOME_POPULAR_POSTS_PERSIST_LIMIT,
  persistHomeSummary,
  persistPopularPosts,
} from '../utils/homeCacheStorage';
import {
  mapActivitiesToEvents,
  pickHomeFeaturedEvents,
  type EventCardUi,
  type FeaturedEvent,
} from '../utils/apiMappers';
import { sanitizeImageList, sanitizeRemoteImageUrl } from '../utils/imageUrl';
import {
  compareActivitiesNearestFirst,
  findNearestUpcomingActivity,
  getActivityStatusFromActivity,
  type ActivityDateFields,
} from '../utils/activityStatus';
import {
  invalidateNotifications,
  invalidateRegistration,
  invalidatePostFeeds,
  invalidateAllPosts,
  invalidatePostComments,
  invalidateUser,
  invalidateProfile,
  invalidateProfilePackageState,
  invalidateProfileEntitlements,
  patchLikedPostInCaches,
  patchPostStatusInCaches,
  patchUpdatedProfilePostInCaches,
} from '../utils/queryInvalidation';

export async function invalidateNotificationQueries() {
  return invalidateNotifications();
}

export function useNotificationsQuery() {
  const enabled = isApiEnabled();
  const userId = getClientUserId();

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
  const userId = getClientUserId();

  return useApiQuery({
    queryKey: ['notifications', 'unread', userId],
    queryFn: () => fetchNotificationUnreadCount(userId),
    enabled,
    staleTime: 30_000,
  });
}

export async function markNotificationAsRead(id: string) {
  const userId = getClientUserId();
  await markNotificationRead(id, userId);
  await invalidateNotificationQueries();
}

export async function markAllNotificationsAsRead() {
  const userId = getClientUserId();
  await markAllNotificationsRead(userId);
  await invalidateNotificationQueries();
}

export async function deleteNotificationAndInvalidate(id: string) {
  const userId = getClientUserId();
  await deleteNotification(id, userId);
  await invalidateNotificationQueries();
}

export async function clearAllNotificationsAndInvalidate() {
  const userId = getClientUserId();
  await clearAllNotifications(userId);
  await invalidateNotificationQueries();
}

type QueryEnableOptions = { enabled?: boolean };

export function useActivitiesQuery(options?: QueryEnableOptions) {
  const tabEnabled = options?.enabled ?? true;
  const enabled = isApiEnabled() && tabEnabled;

  return useApiQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const activities = await fetchActivities();
      seedActivityDetailsFromList(activities);
      return activities;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useEventList(options?: QueryEnableOptions) {
  const tabEnabled = options?.enabled ?? true;
  const query = useActivitiesQuery({ enabled: tabEnabled });

  const events = useMemo((): EventCardUi[] => {
    if (!query.data) return [];
    return [...mapActivitiesToEvents(query.data)].sort(compareActivitiesNearestFirst);
  }, [query.data]);

  return {
    events,
    isLoading: tabEnabled && query.isLoading,
    isError: tabEnabled && query.isError,
    refetch: query.refetch,
  };
}

export function useHomeSummary() {
  return useApiQuery({
    queryKey: ['home', 'summary'],
    queryFn: async () => {
      const result = await fetchHomeSummary();
      persistHomeSummary(result);
      return result;
    },
    enabled: isApiEnabled(),
    staleTime: 60_000,
  });
}

export function useFeaturedEvents() {
  const { data: summary, isLoading } = useHomeSummary();

  const items = useMemo((): FeaturedEvent[] => {
    const signupEvents = summary?.signupEvents ?? [];
    const inProgress = signupEvents.filter(
      (item) => getActivityStatusFromActivity(item.date, item.title) === 'in_progress',
    );
    return pickHomeFeaturedEvents(inProgress);
  }, [summary]);

  return {
    items,
    isLoading,
  };
}

function mergeHomeCountdownCandidates(
  signupEvents: HomeSummary['signupEvents'],
  activities: import('../types/backend').BackendActivity[] | undefined,
): ActivityDateFields[] {
  const seen = new Set<string>();
  const candidates: ActivityDateFields[] = [];

  const add = (title: string, date?: string) => {
    const key = `${title}|${date ?? ''}`;
    if (seen.has(key)) return;
    seen.add(key);
    candidates.push({ title, date });
  };

  for (const event of signupEvents) {
    add(event.title, event.date);
  }
  for (const activity of activities ?? []) {
    add(activity.name, activity.date);
  }

  return candidates;
}

/** Countdown uses home summary only — avoids a second `/activities` fetch on tab open. */
export function useNearestUpcomingForCountdown() {
  const { data: summary } = useHomeSummary();

  return useMemo(() => {
    const signupEvents = summary?.signupEvents ?? [];
    const candidates = mergeHomeCountdownCandidates(signupEvents, undefined);
    const nearest = findNearestUpcomingActivity(candidates);
    if (!nearest) return null;

    const title = nearest.title ?? nearest.name;
    if (!title) return null;

    return { title, startAt: nearest.startAt };
  }, [summary]);
}

export function useActivityDetailQuery(legacyId?: number) {
  const enabled =
    isApiEnabled() && legacyId != null && !Number.isNaN(legacyId) && legacyId > 0;

  return useApiQuery({
    queryKey: ['activities', 'detail', legacyId],
    queryFn: () => fetchActivityByLegacyId(legacyId as number),
    enabled,
    staleTime: 60_000,
  });
}

export function usePopularPostsQuery(options?: QueryEnableOptions) {
  const tabEnabled = options?.enabled ?? true;
  const enabled = isApiEnabled() && tabEnabled;
  const userId = getClientUserId();

  return useApiQuery({
    queryKey: ['posts', 'popular', userId],
    queryFn: async () => {
      const result = await fetchPopularPosts(HOME_POPULAR_POSTS_PERSIST_LIMIT);
      persistPopularPosts(result);
      return result;
    },
    enabled,
    staleTime: 30_000,
  });
}

export function usePopularPosts(options?: QueryEnableOptions) {
  const query = usePopularPostsQuery(options);

  const posts: HomeFeedPost[] = (query.data ?? []).map(mapHomeFeedPost);

  return {
    posts,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

function mapHomeFeedPost(item: HomeFeedPost): HomeFeedPost {
  const name = item.name?.trim() || '用户';
  const handle = item.handle?.trim() || `@${name}`;
  return {
    id: item.id,
    userId: item.userId,
    authorGender: item.authorGender,
    name,
    handle,
    event: item.event,
    location: item.location,
    body: item.body,
    time: item.time,
    likes: item.likes,
    liked: item.liked,
    comments: item.comments ?? 0,
    avatar: sanitizeRemoteImageUrl(item.avatar) ?? item.avatar,
    status: item.status ?? '招募中',
    activityLegacyId: item.activityLegacyId,
    contentTypes: item.contentTypes,
    images: sanitizeImageList(item.images),
  };
}

export function useEventPostsQuery(
  activityLegacyId?: number,
  options?: QueryEnableOptions,
) {
  const tabEnabled = options?.enabled ?? true;
  const enabled =
    isApiEnabled() &&
    activityLegacyId != null &&
    !Number.isNaN(activityLegacyId) &&
    tabEnabled;
  const userId = getClientUserId();

  return useApiQuery({
    queryKey: ['posts', 'activity', activityLegacyId, userId],
    queryFn: () => fetchPostsByActivity(activityLegacyId as number),
    enabled,
    staleTime: 30_000,
  });
}

export function usePostCommentsQuery(postId: string, enabled: boolean) {
  const apiEnabled = isApiEnabled();

  return useApiQuery({
    queryKey: ['posts', postId, 'comments'],
    queryFn: () => fetchPostComments(postId),
    enabled: apiEnabled && enabled && Boolean(postId),
    staleTime: 10_000,
  });
}

export function useCurrentUserQuery() {
  const enabled = isApiEnabled();

  return useApiQuery({
    queryKey: ['users', 'me'],
    queryFn: fetchCurrentUser,
    enabled,
    staleTime: 60_000,
  });
}

export async function invalidateRegistrationQueries() {
  await invalidateRegistration();
}

export async function registerForActivityAndInvalidate(legacyId: number) {
  const result = await registerForActivity(legacyId);
  try {
    await invalidateRegistrationQueries();
  } catch {
    // Registration succeeded; cache refresh is best-effort.
  }
  return result;
}

export async function cancelActivityRegistrationAndInvalidate(legacyId: number) {
  const result = await cancelActivityRegistration(legacyId);
  await invalidateRegistrationQueries();
  return result;
}

export async function updateCurrentUserAndInvalidate(
  payload: UpdateCurrentUserPayload,
) {
  const user = await updateCurrentUser(payload);
  await Promise.all([invalidateUser(), invalidateProfile()]);
  return user;
}

export async function blockUserAndInvalidate(blockedUserId: string) {
  const result = await blockUser(blockedUserId);
  await invalidatePostFeeds();
  return result;
}

export async function submitReportAndInvalidate(payload: ReportPayload) {
  return submitReport(payload);
}

export function useProfileSummaryQuery(activityLegacyId?: number) {
  const enabled = isApiEnabled();
  const scopedId =
    activityLegacyId != null && !Number.isNaN(activityLegacyId)
      ? activityLegacyId
      : undefined;

  return useApiQuery({
    queryKey: ['profile', 'summary', scopedId ?? 'all'],
    queryFn: () => fetchProfileSummary(scopedId),
    enabled,
    staleTime: 60_000,
  });
}

export function useProfilePackagesQuery() {
  const enabled = isApiEnabled();

  return useApiQuery({
    queryKey: ['profile', 'packages'],
    queryFn: fetchProfilePackages,
    enabled,
    staleTime: 300_000,
  });
}

export function useProfileEntitlementsQuery(activityLegacyId?: number) {
  const enabled = isApiEnabled();
  const scopedId =
    activityLegacyId != null && !Number.isNaN(activityLegacyId)
      ? activityLegacyId
      : undefined;

  return useApiQuery({
    queryKey: ['profile', 'entitlements', scopedId ?? 'all'],
    queryFn: () => fetchProfileEntitlements(scopedId),
    enabled,
    staleTime: 30_000,
  });
}

export async function purchaseProfilePackageAndInvalidate(
  payload: PurchaseProfilePackagePayload,
) {
  const result = await purchaseProfilePackage(payload);
  await invalidateProfilePackageState();
  return result;
}

export async function consumeProfileAiMatchAndInvalidate(activityLegacyId: number) {
  if (Number.isNaN(activityLegacyId)) {
    throw new Error('activityLegacyId is required');
  }
  const result = await consumeProfileAiMatch({ activityLegacyId });
  await invalidateProfileEntitlements();
  return result;
}

export async function consumeProfileContactUnlockAndInvalidate(
  activityLegacyId: number,
) {
  if (Number.isNaN(activityLegacyId)) {
    throw new Error('activityLegacyId is required');
  }
  const result = await consumeProfileContactUnlock({ activityLegacyId });
  await invalidateProfileEntitlements();
  return result;
}

export function useProfileActivitiesQuery() {
  const enabled = isApiEnabled();

  return useApiQuery({
    queryKey: ['profile', 'activities'],
    queryFn: fetchProfileActivities,
    enabled,
    staleTime: 60_000,
  });
}

export function useProfilePostsQuery() {
  const enabled = isApiEnabled();

  return useApiQuery({
    queryKey: ['profile', 'posts'],
    queryFn: fetchProfilePosts,
    enabled,
    staleTime: 30_000,
  });
}

export async function invalidatePostQueries() {
  await invalidateAllPosts();
}

export async function deletePostAndInvalidate(postId: string) {
  await deletePost(postId);
  await invalidatePostQueries();
}

export async function likePostAndInvalidate(postId: string) {
  const updated = await likePost(postId);
  patchLikedPostInCaches(updated);
  await invalidateNotificationQueries();
  return updated;
}

export async function commentPostAndInvalidate(
  postId: string,
  body: string,
  parentCommentId?: string,
) {
  const updated = await addPostComment(postId, body, parentCommentId);
  patchLikedPostInCaches(updated);
  await Promise.all([invalidateNotificationQueries(), invalidatePostComments(postId)]);
}

export async function applyToPostAndInvalidate(postId: string) {
  return applyToPost(postId);
}

export async function updatePostAndInvalidate(
  postId: string,
  payload: Parameters<typeof updatePost>[1],
) {
  const updated = await updatePost(postId, payload);
  if (payload.body !== undefined) {
    patchUpdatedProfilePostInCaches(updated);
  } else {
    patchPostStatusInCaches(postId, updated.status);
  }
  await invalidatePostQueries();
  return updated;
}
