import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
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
  fetchProfileActivities,
  fetchProfilePosts,
  fetchProfileSummary,
  likePost,
  markAllNotificationsRead,
  markNotificationRead,
  registerForActivity,
  updateCurrentUser,
  updatePost,
} from "../api/syncApi";
import type { UpdateCurrentUserPayload } from "../types/backend";
import { isApiEnabled } from "../constants/api";
import { eventSignupItems, homeHeatStats } from "../pages/index/mockData";
import { activityPosts, type ActivityPost } from "../pages/index/homeData";
import { getClientUserId } from "../utils/session";
import {
  mapActivitiesToEvents,
  pickHomeFeaturedEvents,
  type EventCardUi,
} from "../utils/apiMappers";
import { featuredEvents, type FeaturedEvent } from "../pages/index/homeData";
import { getActivityStatusFromActivity } from "../utils/activityStatus";

const MOCK_EVENTS: EventCardUi[] = [
  {
    id: "1",
    title: "Tomorrowland 预热派对",
    date: "06/18–19 22:00",
    location: "CLUB SPACE · 上海",
    distance: "5.0 km",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80",
    attendees: 238,
    category: "户外电音",
    hot: true,
    going: false,
  },
  {
    id: "2",
    title: "EDC China 2025",
    date: "07/12–13 16:00",
    location: "苏州阳澄湖",
    distance: "15 km",
    image: "https://image.electricdaisycarnival.cn/sites/7/2024/12/edccn_2025_mk_an_fest_site_mh_1534x1360_r01.jpg",
    attendees: 512,
    category: "EDM节",
    hot: true,
    going: true,
  },
];

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

  const events = useMemo(() => {
    if (!isApiEnabled()) {
      return tabEnabled ? MOCK_EVENTS : [];
    }
    if (!query.data) return [];
    return mapActivitiesToEvents(query.data);
  }, [query.data, tabEnabled]);

  return {
    events,
    isLoading: tabEnabled && query.isLoading,
    isError: tabEnabled && query.isError,
    refetch: query.refetch,
    usingMock: !isApiEnabled(),
  };
}

export function useHomeSummary() {
  const enabled = isApiEnabled();

  const query = useQuery({
    queryKey: ["home"],
    queryFn: fetchHomeSummary,
    enabled,
    staleTime: 60_000,
  });

  const heat = enabled ? query.data?.heat ?? homeHeatStats : homeHeatStats;

  return {
    heat,
    signupEvents: enabled ? query.data?.signupEvents ?? [] : eventSignupItems,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    usingMock: !enabled,
  };
}

function isInProgressFeaturedEvent(item: { date: string; title: string }): boolean {
  return getActivityStatusFromActivity(item.date, item.title) === "in_progress";
}

export function useFeaturedEvents() {
  const { signupEvents, isLoading, usingMock } = useHomeSummary();

  const items = useMemo((): FeaturedEvent[] => {
    if (usingMock) {
      return featuredEvents.filter(isInProgressFeaturedEvent);
    }
    const inProgress = signupEvents.filter(isInProgressFeaturedEvent);
    return pickHomeFeaturedEvents(inProgress);
  }, [signupEvents, usingMock]);

  return {
    items,
    isLoading: !usingMock && isLoading,
    usingMock,
  };
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

export function usePopularPostsQuery() {
  const enabled = isApiEnabled();

  return useQuery({
    queryKey: ["posts", "popular"],
    queryFn: () => fetchPopularPosts(),
    enabled,
    staleTime: 30_000,
  });
}

export function usePopularPosts() {
  const query = usePopularPostsQuery();
  const enabled = isApiEnabled();

  const posts: ActivityPost[] = enabled
    ? (query.data ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        handle: item.handle,
        event: item.event,
        location: item.location,
        body: item.body,
        time: item.time,
        likes: item.likes,
        avatar: item.avatar,
        status: item.status,
      }))
    : activityPosts;

  return {
    posts,
    isLoading: enabled && query.isLoading,
    isError: enabled && query.isError,
    refetch: query.refetch,
    usingMock: !enabled,
  };
}

export function useEventPostsQuery(activityLegacyId?: number) {
  const enabled = isApiEnabled() && activityLegacyId != null && !Number.isNaN(activityLegacyId);

  return useQuery({
    queryKey: ["posts", "activity", activityLegacyId],
    queryFn: () => fetchPostsByActivity(activityLegacyId as number),
    enabled,
    staleTime: 30_000,
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
  await invalidateRegistrationQueries(queryClient);
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

export async function likePostAndInvalidate(queryClient: QueryClient, postId: string) {
  await likePost(postId);
  await Promise.all([
    invalidatePostQueries(queryClient),
    invalidateNotificationQueries(queryClient),
  ]);
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
