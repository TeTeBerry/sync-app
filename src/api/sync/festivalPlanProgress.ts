import { apiGet } from '../../utils/apiClient';
import type { FestivalPlanProgressDto } from '../../types/festivalPlan';
import { ownerQueryParams } from '../requestContext';

export function fetchFestivalPlanProgress(activityLegacyId: number) {
  return apiGet<FestivalPlanProgressDto>(
    `/activities/${activityLegacyId}/festival-plan-progress`,
    ownerQueryParams(),
  );
}
