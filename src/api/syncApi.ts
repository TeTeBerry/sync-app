import { apiDelete, apiGet, apiPatch, apiPost } from "../utils/apiClient";
import type { ChatSessionRecord } from "../types/aiChat";
import type {
  BackendActivity,
  BackendPindan,
  BackendTicket,
  CreatePindanPayload,
  CreateTicketPayload,
  HomeSummary,
  ProfilePinDanItem,
  ProfileTicketItem,
  UpdatePindanPayload,
} from "../types/backend";

export function fetchActivities() {
  return apiGet<BackendActivity[]>("/activities");
}

export function matchActivity(keyword: string) {
  return apiGet<BackendActivity | null>("/activities/match", { keyword });
}

export function fetchTickets(params?: {
  activityId?: string;
  type?: "sell" | "buy";
}) {
  return apiGet<BackendTicket[]>("/tickets", {
    activityId: params?.activityId,
    type: params?.type,
  });
}

export function createTicket(payload: CreateTicketPayload) {
  return apiPost<BackendTicket>("/tickets", payload);
}

export function createPindan(payload: CreatePindanPayload) {
  return apiPost<BackendPindan>("/pindan", payload);
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

export function fetchProfileTickets(userId?: string) {
  return apiGet<ProfileTicketItem[]>("/profile/tickets", { userId });
}

export function joinPindan(legacyId: number, userId?: string) {
  return apiPost<ProfilePinDanItem>(`/pindan/${legacyId}/join`, { userId });
}

export function leavePindan(legacyId: number, userId?: string) {
  return apiDelete<{ ok: true }>(`/pindan/${legacyId}/join`, { userId });
}

export function updatePindan(legacyId: number, payload: UpdatePindanPayload) {
  return apiPatch<BackendPindan>(`/pindan/${legacyId}`, payload);
}

export function deletePindan(legacyId: number, userId?: string) {
  return apiDelete<{ ok: true }>(`/pindan/${legacyId}`, { userId });
}

export function fetchActivityByLegacyId(legacyId: number) {
  return apiGet<BackendActivity | null>(`/activities/${legacyId}`);
}

export function fetchChatSession(sessionId: string) {
  return apiGet<ChatSessionRecord>(`/chat/sessions/${sessionId}`);
}
