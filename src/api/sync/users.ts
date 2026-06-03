import { apiDelete, apiGet, apiPatch, apiPost } from '../../utils/apiClient';
import type {
  BlockListResult,
  CurrentUser,
  ReportPayload,
  ReportResult,
  ReportStatusResult,
  UpdateCurrentUserPayload,
} from '../../types/backend';
import { ownerQueryParams } from '../requestContext';

export function fetchCurrentUser() {
  return apiGet<CurrentUser>('/users/me', ownerQueryParams());
}

export function updateCurrentUser(payload: UpdateCurrentUserPayload) {
  return apiPatch<CurrentUser>('/users/me', payload, ownerQueryParams());
}

export function fetchBlockedUserIds() {
  return apiGet<BlockListResult>('/users/blocks', ownerQueryParams());
}

export function blockUser(blockedUserId: string) {
  return apiPost<{ ok: true }>('/users/blocks', { blockedUserId }, ownerQueryParams());
}

export function unblockUser(blockedUserId: string) {
  return apiDelete<{ ok: true }>(
    `/users/blocks/${encodeURIComponent(blockedUserId)}`,
    ownerQueryParams(),
  );
}

export function submitReport(payload: ReportPayload) {
  return apiPost<ReportResult>('/reports', payload, ownerQueryParams());
}

export function fetchReportStatus(targetType: 'post', targetId: string) {
  return apiGet<ReportStatusResult>('/reports/status', {
    targetType,
    targetId,
    ...ownerQueryParams(),
  });
}
