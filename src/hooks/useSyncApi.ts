import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import {
  fetchActivities,
  fetchHomeSummary,
  fetchPindanList,
  fetchProfilePindan,
  fetchProfileTickets,
  fetchTickets,
} from "../api/syncApi";
import { isApiEnabled } from "../constants/api";
import { ticketListings as mockTicketListings, type TicketFilterKey } from "../data/ticketListings";
import {
  eventSignupItems,
  homeHeatStats,
  hotPinItems,
  type HotPinItem,
} from "../pages/index/mockData";
import type { BackendActivity } from "../types/backend";
import { getClientUserId } from "../utils/session";
import {
  buildActivityNameMap,
  mapActivitiesToEvents,
  mapPindanToCards,
  mapPindanToPageItems,
  mapTicketsToListings,
  type EventCardUi,
  type PinDanCardUi,
  type PindanPageItem,
} from "../utils/apiMappers";

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

const MOCK_PINDAN: PinDanCardUi[] = [
  {
    id: "2",
    category: "hotel",
    title: "三亚亚特兰蒂斯",
    desc: "海景大床房 · 4人均摊",
    price: 450,
    originalPrice: 1800,
    joined: 2,
    total: 4,
    date: "06/27-30",
    location: "三亚",
    image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&q=80",
    tags: ["海景房", "含早餐"],
    urgent: false,
  },
  {
    id: "3",
    category: "transport",
    title: "上海→三亚 商务舱拼",
    desc: "浦东出发 · 4座同飞",
    price: 1200,
    originalPrice: 4800,
    joined: 2,
    total: 4,
    date: "06/27",
    location: "PVG→SYX",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&q=80",
    tags: ["商务舱", "含行李"],
    urgent: true,
  },
];

export function invalidateTicketQueries(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ["home"] }),
    queryClient.invalidateQueries({ queryKey: ["tickets"] }),
    queryClient.invalidateQueries({ queryKey: ["profile", "tickets"] }),
  ]).then(() =>
    queryClient.refetchQueries({ queryKey: ["tickets"], type: "all" }),
  );
}

export function invalidatePindanQueries(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ["home"] }),
    queryClient.invalidateQueries({ queryKey: ["pindan"] }),
    queryClient.invalidateQueries({ queryKey: ["profile", "pindan"] }),
  ]).then(() =>
    queryClient.refetchQueries({ queryKey: ["pindan"], type: "all" }),
  );
}

export function useInvalidateTicketQueries() {
  const queryClient = useQueryClient();
  return useCallback(() => invalidateTicketQueries(queryClient), [queryClient]);
}

export function useProfileTicketsQuery() {
  const enabled = isApiEnabled();
  const userId = getClientUserId();

  return useQuery({
    queryKey: ["profile", "tickets", userId],
    queryFn: () => fetchProfileTickets(userId),
    enabled,
    staleTime: 15_000,
  });
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

export function usePinDanList(
  category?: "package" | "hotel" | "transport",
  options?: QueryEnableOptions,
) {
  const tabEnabled = options?.enabled ?? true;
  const activitiesQuery = useActivitiesQuery({ enabled: tabEnabled });
  const enabled = isApiEnabled() && tabEnabled;

  const pindanQuery = useQuery({
    queryKey: ["pindan", category],
    queryFn: () => fetchPindanList(category ? { type: category } : undefined),
    enabled,
    staleTime: 30_000,
  });

  const items = useMemo(() => {
    if (!enabled) {
      if (!isApiEnabled() && tabEnabled) {
        return category ? MOCK_PINDAN.filter((item) => item.category === category) : MOCK_PINDAN;
      }
      return [];
    }
    if (!pindanQuery.data) return [];

    const nameMap = buildActivityNameMap(activitiesQuery.data ?? []);
    const cards = mapPindanToCards(pindanQuery.data, nameMap);
    return category ? cards.filter((item) => item.category === category) : cards;
  }, [activitiesQuery.data, category, enabled, pindanQuery.data, tabEnabled]);

  return {
    items,
    isLoading: tabEnabled && (pindanQuery.isLoading || activitiesQuery.isLoading),
    isError: tabEnabled && pindanQuery.isError,
    refetch: pindanQuery.refetch,
    usingMock: !isApiEnabled(),
  };
}

export function useTicketList(filter: TicketFilterKey, options?: QueryEnableOptions) {
  const tabEnabled = options?.enabled ?? true;
  const activitiesQuery = useActivitiesQuery({ enabled: tabEnabled });
  const enabled = isApiEnabled() && tabEnabled;

  const ticketsQuery = useQuery({
    queryKey: ["tickets", filter],
    queryFn: () =>
      fetchTickets(filter === "all" ? undefined : { type: filter }),
    enabled,
    staleTime: 30_000,
    refetchOnMount: enabled ? "always" : false,
  });

  const listings = useMemo(() => {
    if (!enabled) {
      if (!isApiEnabled() && tabEnabled) {
        if (filter === "all") return mockTicketListings;
        return mockTicketListings.filter((item) => item.type === filter);
      }
      return [];
    }
    if (!ticketsQuery.data) return [];

    const nameMap = buildActivityNameMap(activitiesQuery.data ?? []);
    return mapTicketsToListings(ticketsQuery.data, nameMap);
  }, [activitiesQuery.data, enabled, filter, ticketsQuery.data, tabEnabled]);

  return {
    listings,
    activities: activitiesQuery.data ?? ([] as BackendActivity[]),
    isLoading: tabEnabled && (ticketsQuery.isLoading || activitiesQuery.isLoading),
    isError: tabEnabled && ticketsQuery.isError,
    refetch: ticketsQuery.refetch,
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

  return {
    heat: enabled ? query.data?.heat ?? homeHeatStats : homeHeatStats,
    signupEvents: enabled ? query.data?.signupEvents ?? [] : eventSignupItems,
    hotPins,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    usingMock: !enabled,
  };
}

export function usePindanPageItems() {
  const activitiesQuery = useActivitiesQuery();
  const enabled = isApiEnabled();

  const pindanQuery = useQuery({
    queryKey: ["pindan", "page"],
    queryFn: () => fetchPindanList(),
    enabled,
    staleTime: 30_000,
  });

  const items = useMemo((): PindanPageItem[] => {
    if (!enabled || !pindanQuery.data) return [];
    return mapPindanToPageItems(pindanQuery.data);
  }, [enabled, pindanQuery.data]);

  return {
    items,
    isLoading: pindanQuery.isLoading || activitiesQuery.isLoading,
    isError: pindanQuery.isError,
    refetch: pindanQuery.refetch,
    usingMock: !enabled,
  };
}

export function useProfilePindanQuery() {
  const enabled = isApiEnabled();
  const userId = getClientUserId();

  return useQuery({
    queryKey: ["profile", "pindan", userId],
    queryFn: () => fetchProfilePindan(userId),
    enabled,
    staleTime: 15_000,
  });
}
