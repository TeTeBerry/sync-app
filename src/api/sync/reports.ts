import { apiGet, apiPost } from '../../utils/apiClient';
import type {
  ReportPayload,
  ReportResult,
  ReportStatusResult,
  ReportTargetType,
} from '../../types/backend';
import { mergeOwnerQueryParams, ownerQueryParams } from '../requestContext';

export function fetchReportStatus(targetType: ReportTargetType, targetId: string) {
  return apiGet<ReportStatusResult>(
    '/reports/status',
    mergeOwnerQueryParams({
      targetType,
      targetId,
    }),
  );
}

export function submitReport(payload: ReportPayload) {
  return apiPost<ReportResult>('/reports', payload, ownerQueryParams());
}
