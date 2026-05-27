import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import {
  addPostComment,
  applyToPost,
  cancelActivityRegistration,
  deletePost,
  fetchActivities,
  fetchActivityByLegacyId,
  fetchAllPosts,
  fetchCurrentUser,
  fetchHomeSummary,
  fetchNotificationUnreadCount,
  fetchNotifications,
  fetchPopularPosts,
  fetchPostsByActivity,
  fetchPostComments,
  fetchProfileActivities,
  fetchProfilePosts,
  fetchProfileSummary,
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
} from "../api/syncApi";
import type {
  EventDetailPost,
  HomeFeedPost,
  HomeSummary,
  ReportPayload,
  UpdateCurrentUserPayload,
} from "../types/backend";
import { isApiEnabled } from "../constants/api";
import { getClientUserId } from "../utils/session";
import {
  mapActivitiesToEvents,
  pickHomeFeaturedEvents,
  type EventCardUi,
  type FeaturedEvent,
} from "../utils/apiMappers";
import {
  findNearestUpcomingActivity,
  getActivityStatusFromActivity,
  type ActivityDateFields,
} from "../utils/activityStatus";

export function invalidateNotificationQueries(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  ]);
}

export function useInvalidateNotificationQueries() {
  const queryClient = useQueryClient();
  return useCallback(() => invalidateNotificationQueries(queryClient), [queryClient]);
}

export function useNotificationsQuery() {
  const enabled = isApiEnabled();
  const userId = getClientUserId();

  return useQuery({
    queryKey: ["notifications", "list", userId],
    queryFn: () => fetchNotifications(userId),
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useNotificationUnreadCount() {
  const enabled = isApiEnabled();
  const userId = getClientUserId();

  return useQuery({
    queryKey: ["notifications", "unread", userId],
    queryFn: () => fetchNotificationUnreadCount(userId),
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export async function markNotificationAsRead(id: string, queryClient: QueryClient) {
  const userId = getClientUserId();
  await markNotificationRead(id, userId);
  await invalidateNotificationQueries(queryClient);
}

export async function markAllNotificationsAsRead(queryClient: QueryClient) {
  const userId = getClientUserId();
  await markAllNotificationsRead(userId);
  await invalidateNotificationQueries(queryClient);
}

export async function deleteNotificationAndInvalidate(
  queryClient: QueryClient,
  id: string,
) {
  const userId = getClientUserId();
  await deleteNotification(id, userId);
  await invalidateNotificationQueries(queryClient);
}

export async function clearAllNotificationsAndInvalidate(queryClient: QueryClient) {
  const userId = getClientUserId();
  await clearAllNotifications(userId);
  await invalidateNotificationQueries(queryClient);
}

type QueryEnableOptions = { enabled?: boolean };

export function useActivitiesQuery(options?: QueryEnableOptions) {
  const tabEnabled = options?.enabled ?? true;
  const enabled = isApiEnabled() && tabEnabled;

  return useQuery({
    queryKey: ["activities"],
    queryFn: fetchActivities,
    enabled,
    staleTime: 60_000,
  });
}

export function useEventList(options?: QueryEnableOptions) {
  const tabEnabled = options?.enabled ?? true;
  const query = useActivitiesQuery({ enabled: tabEnabled });

  const events = useMemo((): EventCardUi[] => {
    if (!query.data) return [];
    return mapActivitiesToEvents(query.data);
  }, [query.data]);

  return {
    events,
    isLoading: tabEnabled && query.isLoading,
    isError: tabEnabled && query.isError,
    refetch: query.refetch,
  };
}

export function useHomeSummary() {
  const enabled = isApiEnabled();
  const userId = getClientUserId();

  const query = useQuery({
    queryKey: ["home", userId],
    queryFn: fetchHomeSummary,
    enabled,
    staleTime: 60_000,
  });

  return {
    heat: query.data?.heat ?? { people: 0, growthPercent: 0 },
    signupEvents: query.data?.signupEvents ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

function isInProgressFeaturedEvent(item: { date: string; title: string }): boolean {
  return getActivityStatusFromActivity(item.date, item.title) === "in_progress";
}

export function useFeaturedEvents() {
  const { signupEvents, isLoading } = useHomeSummary();

  const items = useMemo((): FeaturedEvent[] => {
    const inProgress = signupEvents.filter(isInProgressFeaturedEvent);
    return pickHomeFeaturedEvents(inProgress);
  }, [signupEvents]);

  return {
    items,
    isLoading,
  };
}

function mergeHomeCountdownCandidates(
  signupEvents: HomeSummary["signupEvents"],
  activities: import("../types/backend").BackendActivity[] | undefined,
): ActivityDateFields[] {
  const seen = new Set<string>();
  const candidates: ActivityDateFields[] = [];

  const add = (title: string, date?: string) => {
    const key = `${title}|${date ?? ""}`;
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

export function useNearestUpcomingForCountdown(options?: QueryEnableOptions) {
  const { signupEvents } = useHomeSummary();
  const tabEnabled = options?.enabled ?? true;
  const activitiesQuery = useActivitiesQuery({ enabled: tabEnabled });

  return useMemo(() => {
    const candidates = mergeHomeCountdownCandidates(signupEvents, activitiesQuery.data);
    const nearest = findNearestUpcomingActivity(candidates);
    if (!nearest) return null;

    const title = nearest.title ?? nearest.name;
    if (!title) return null;

    return { title, startAt: nearest.startAt };
  }, [signupEvents, activitiesQuery.data]);
}

export function useActivityDetailQuery(legacyId?: number) {
  const enabled =
    isApiEnabled() && legacyId != null && !Number.isNaN(legacyId) && legacyId > 0;

  return useQuery({
    queryKey: ["activities", "detail", legacyId],
    queryFn: () => fetchActivityByLegacyId(legacyId as number),
    enabled,
    staleTime: 60_000,
  });
}

export function usePopularPostsQuery(options?: QueryEnableOptions) {
  const tabEnabled = options?.enabled ?? true;
  const enabled = isApiEnabled() && tabEnabled;
  const userId = getClientUserId();

  return useQuery({
    queryKey: ["posts", "popular", userId],
    queryFn: () => fetchPopularPosts(),
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
  return {
    id: item.id,
    userId: item.userId,
    name: item.name,
    handle: item.handle,
    event: item.event,
    location: item.location,
    body: item.body,
    time: item.time,
    likes: item.likes,
    liked: item.liked,
    comments: item.comments ?? 0,
    avatar: item.avatar,
    status: item.status,
  };
}

export function useAllPostsQuery() {
  const enabled = isApiEnabled();
  const userId = getClientUserId();

  const query = useQuery({
    queryKey: ["posts", "all", userId],
    queryFn: fetchAllPosts,
    enabled,
    staleTime: 30_000,
  });

  const posts: HomeFeedPost[] = (query.data ?? []).map(mapHomeFeedPost);

  return {
    posts,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
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

  return useQuery({
    queryKey: ["posts", "activity", activityLegacyId, userId],
    queryFn: () => fetchPostsByActivity(activityLegacyId as number),
    enabled,
    staleTime: 30_000,
  });
}

export function usePostCommentsQuery(postId: string, enabled: boolean) {
  const apiEnabled = isApiEnabled();

  return useQuery({
    queryKey: ["posts", postId, "comments"],
    queryFn: () => fetchPostComments(postId),
    enabled: apiEnabled && enabled && Boolean(postId),
    staleTime: 10_000,
  });
}

export function useCurrentUserQuery() {
  const enabled = isApiEnabled();

  return useQuery({
    queryKey: ["users", "me"],
    queryFn: fetchCurrentUser,
    enabled,
    staleTime: 60_000,
  });
}

export async function invalidateRegistrationQueries(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["profile", "activities"] }),
    queryClient.invalidateQueries({ queryKey: ["profile", "summary"] }),
    queryClient.invalidateQueries({ queryKey: ["users", "me"] }),
    queryClient.invalidateQueries({ queryKey: ["home"] }),
  ]);
}

export async function registerForActivityAndInvalidate(
  queryClient: QueryClient,
  legacyId: number,
) {
  const result = await registerForActivity(legacyId);
  const userId = getClientUserId();
  try {
    queryClient.setQueryData<HomeSummary>(["home", userId], (prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        signupEvents: prev.signupEvents.map((event) =>
          event.id === legacyId ? { ...event, going: true } : event,
        ),
      };
    });
    await invalidateRegistrationQueries(queryClient);
  } catch {
    // Registration succeeded; cache refresh is best-effort.
  }
  return result;
}

export async function cancelActivityRegistrationAndInvalidate(
  queryClient: QueryClient,
  legacyId: number,
) {
  const result = await cancelActivityRegistration(legacyId);
  await invalidateRegistrationQueries(queryClient);
  return result;
}

export async function updateCurrentUserAndInvalidate(
  queryClient: QueryClient,
  payload: UpdateCurrentUserPayload,
) {
  const user = await updateCurrentUser(payload);
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["users", "me"] }),
    queryClient.invalidateQueries({ queryKey: ["profile", "summary"] }),
  ]);
  return user;
}

async function invalidatePostFeedQueries(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["posts", "popular"] }),
    queryClient.invalidateQueries({ queryKey: ["posts", "all"] }),
    queryClient.invalidateQueries({ queryKey: ["posts", "activity"] }),
  ]);
}

export async function blockUserAndInvalidate(
  queryClient: QueryClient,
  blockedUserId: string,
) {
  const result = await blockUser(blockedUserId);
  await invalidatePostFeedQueries(queryClient);
  return result;
}

export async function submitReportAndInvalidate(
  queryClient: QueryClient,
  payload: ReportPayload,
) {
  return submitReport(payload);
}

export function useProfileSummaryQuery() {
  const enabled = isApiEnabled();

  return useQuery({
    queryKey: ["profile", "summary"],
    queryFn: fetchProfileSummary,
    enabled,
    staleTime: 60_000,
  });
}

export function useProfileActivitiesQuery() {
  const enabled = isApiEnabled();

  return useQuery({
    queryKey: ["profile", "activities"],
    queryFn: fetchProfileActivities,
    enabled,
    staleTime: 60_000,
  });
}

export function useProfilePostsQuery() {
  const enabled = isApiEnabled();

  return useQuery({
    queryKey: ["profile", "posts"],
    queryFn: fetchProfilePosts,
    enabled,
    staleTime: 30_000,
  });
}

export async function invalidatePostQueries(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["posts"] }),
    queryClient.invalidateQueries({ queryKey: ["profile", "posts"] }),
    queryClient.invalidateQueries({ queryKey: ["profile", "summary"] }),
  ]);
}

export async function deletePostAndInvalidate(queryClient: QueryClient, postId: string) {
  await deletePost(postId);
  await invalidatePostQueries(queryClient);
}

function patchLikedPostInCaches(
  queryClient: QueryClient,
  updated: Pick<EventDetailPost, "id" | "likes" | "liked" | "comments">,
) {
  const patchFeedPosts = (posts: HomeFeedPost[] | undefined) =>
    posts?.map((post) =>
      post.id === updated.id
        ? {
            ...post,
            likes: updated.likes,
            liked: updated.liked ?? false,
            comments: updated.comments ?? post.comments,
          }
        : post,
    );

  const patchEventPosts = (posts: EventDetailPost[] | undefined) =>
    posts?.map((post) =>
      post.id === updated.id
        ? {
            ...post,
            likes: updated.likes,
            liked: updated.liked ?? false,
            comments: updated.comments ?? post.comments,
          }
        : post,
    );

  queryClient.setQueriesData<HomeFeedPost[]>({ queryKey: ["posts", "popular"] }, patchFeedPosts);
  queryClient.setQueriesData<HomeFeedPost[]>({ queryKey: ["posts", "all"] }, patchFeedPosts);
  queryClient.setQueriesData<EventDetailPost[]>({ queryKey: ["posts", "activity"] }, patchEventPosts);
}

export async function likePostAndInvalidate(queryClient: QueryClient, postId: string) {
  const updated = await likePost(postId);
  patchLikedPostInCaches(queryClient, updated);
  await Promise.all([
    invalidatePostQueries(queryClient),
    invalidateNotificationQueries(queryClient),
  ]);
  return updated;
}

export async function commentPostAndInvalidate(
  queryClient: QueryClient,
  postId: string,
  body: string,
  parentCommentId?: string,
) {
  await addPostComment(postId, body, parentCommentId);
  await Promise.all([
    invalidatePostQueries(queryClient),
    invalidateNotificationQueries(queryClient),
    queryClient.invalidateQueries({ queryKey: ["posts", postId, "comments"] }),
  ]);
}

export async function applyToPostAndInvalidate(queryClient: QueryClient, postId: string) {
  return applyToPost(postId);
}

export async function updatePostAndInvalidate(
  queryClient: QueryClient,
  postId: string,
  payload: Parameters<typeof updatePost>[1],
) {
  await updatePost(postId, payload);
  await invalidatePostQueries(queryClient);
}
