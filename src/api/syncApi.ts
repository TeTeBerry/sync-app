import { apiGet, apiPost } from "../utils/apiClient";
import type {
  BackendActivity,
  BackendPindan,
  BackendTicket,
  CreateTicketPayload,
  HomeSummary,
} from "../types/backend";

export function fetchActivities() {
  return apiGet<BackendActivity[]>("/activities");
}

export function matchActivity(keyword: string) {
  return apiGet<BackendActivity | null>("/activities/match", { keyword });
}

export function fetchTickets(params?: { activityId?: string; type?: "sell" | "buy" }) {
  return apiGet<BackendTicket[]>("/tickets", {
    activityId: params?.activityId,
    type: params?.type,
  });
}

export function createTicket(payload: CreateTicketPayload) {
  return apiPost<BackendTicket>("/tickets", payload);
}

export function fetchPindanList(params?: {
  activityId?: string;
  type?: "package" | "hotel" | "transport";
  keyword?: string;
}) {
  return apiGet<BackendPindan[]>("/pindan", {
    activityId: params?.activityId,
    type: params?.type,
    keyword: params?.keyword,
  });
}

export function fetchHomeSummary() {
  return apiGet<HomeSummary>("/home");
}

export function fetchActivityByLegacyId(legacyId: number) {
  return apiGet<BackendActivity | null>(`/activities/${legacyId}`);
}
