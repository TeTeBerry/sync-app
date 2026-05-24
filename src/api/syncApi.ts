import { apiDelete, apiGet, apiPost } from "../utils/apiClient";
import type {
  BackendActivity,
  BackendPindan,
  BackendTicket,
  CreateTicketPayload,
  HomeSummary,
  ProfilePinDanItem,
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

export function fetchProfilePindan(userId?: string) {
  return apiGet<ProfilePinDanItem[]>("/profile/pindan", { userId });
}

export function joinPindan(legacyId: number, userId?: string) {
  return apiPost<ProfilePinDanItem>(`/pindan/${legacyId}/join`, { userId });
}

export function leavePindan(legacyId: number, userId?: string) {
  return apiDelete<{ ok: true }>(`/pindan/${legacyId}/join`, { userId });
}

export function fetchActivityByLegacyId(legacyId: number) {
  return apiGet<BackendActivity | null>(`/activities/${legacyId}`);
}
