import { apiPost } from '../../utils/apiClient';
import { ownerQueryParams } from '../requestContext';

export type ActivityEngagementAction = 'lineup_viewed' | 'recruit_searched';

export function recordActivityEngagement(
  activityLegacyId: number,
  action: ActivityEngagementAction,
) {
  return apiPost<{ ok: true }>(
    `/activities/${activityLegacyId}/engagement`,
    { action },
    ownerQueryParams(),
  );
}
