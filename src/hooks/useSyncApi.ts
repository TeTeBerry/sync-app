import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import {
  fetchActivities,
  fetchHomeSummary,
  fetchNotificationUnreadCount,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../api/syncApi";
import { isApiEnabled } from "../constants/api";
import { eventSignupItems, homeHeatStats, hotPinItems, type HotPinItem } from "../pages/index/mockData";
import { getClientUserId } from "../utils/session";
import { mapActivitiesToEvents, type EventCardUi } from "../utils/apiMappers";
import { buildParticipatedActivities, type ProfileParticipatedItem } from "../utils/profileParticipated";

const MOCK_EVENTS: EventCardUi[] = [
  {
    id: "1",
    title: "S2O 三亚电音节",
    date: "06/28–29 14:00",
    location: "三亚海棠湾",
    distance: "2.5 km",
    image: "https://images.unsplash.com/photo-1540039155732-d674d4e3f421?w=400&q=80",
    attendees: 238,
    pinCount: 12,
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
    image: "https://images.unsplash.com/photo-1470229722913-7c090be5c520?w=400&q=80",
    attendees: 512,
    pinCount: 35,
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

  const hotPins: HotPinItem[] = enabled
    ? (query.data?.hotPins ?? []).map((item) => ({
        id: item.id,
        rank: item.rank,
        title: item.title,
        badge: item.badge,
        category: item.category,
        categoryTone: item.categoryTone,
        people: item.people,
        pinType: item.pinType,
        pinItemId: Number(item.pinItemId),
      }))
    : hotPinItems;

  const heat = enabled ? query.data?.heat ?? homeHeatStats : homeHeatStats;

  return {
    heat: {
      ...heat,
      teamOrders: heat.pinOrders,
    },
    signupEvents: enabled ? query.data?.signupEvents ?? [] : eventSignupItems,
    hotPins,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    usingMock: !enabled,
  };
}

export function useProfileParticipatedItems() {
  const activitiesQuery = useActivitiesQuery();
  const enabled = isApiEnabled();

  const items = useMemo((): ProfileParticipatedItem[] => {
    if (!enabled) {
      return buildParticipatedActivities();
    }
    return buildParticipatedActivities(activitiesQuery.data ?? []);
  }, [activitiesQuery.data, enabled]);

  const isLoading = enabled && activitiesQuery.isLoading && !activitiesQuery.data;
  const isError = enabled && activitiesQuery.isError;

  const refetch = useCallback(async () => {
    if (!enabled) return;
    await activitiesQuery.refetch();
  }, [activitiesQuery, enabled]);

  return {
    items,
    isLoading,
    isError,
    refetch,
    usingMock: !enabled,
  };
}
