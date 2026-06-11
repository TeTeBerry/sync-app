import { apiGet, apiPost } from '../../utils/apiClient';
import type {
  RecognizeTravelPlanReceiptPayload,
  RecognizeTravelPlanReceiptResult,
  SavedTravelPlanResult,
  SaveTravelPlanPayload,
  SaveTravelPlanResult,
} from '../../types/backend';
import { ownerQueryParams } from '../requestContext';

export function fetchSavedTravelPlan(activityLegacyId: number) {
  return apiGet<SavedTravelPlanResult>(
    `/activities/${activityLegacyId}/travel-plan/saved`,
    ownerQueryParams(),
  );
}

export function saveTravelPlan(
  activityLegacyId: number,
  payload: SaveTravelPlanPayload,
) {
  return apiPost<SaveTravelPlanResult>(
    `/activities/${activityLegacyId}/travel-plan/save`,
    payload,
    ownerQueryParams(),
  );
}

export function recognizeTravelPlanReceipt(
  activityLegacyId: number,
  payload: RecognizeTravelPlanReceiptPayload,
) {
  return apiPost<RecognizeTravelPlanReceiptResult>(
    `/activities/${activityLegacyId}/travel-plan/recognize-receipt`,
    payload,
    ownerQueryParams(),
  );
}
