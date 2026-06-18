import { eventCityFromLocation } from '../../../../utils/travelGuideDepartureSuggestions';

/** Skip duplicate activity fetch when parent already resolved location. */
export function resolveOrchestratorActivityQueryId(
  activityLegacyId?: number,
  activityLocation?: string,
): number | undefined {
  return activityLocation != null ? undefined : activityLegacyId;
}

export function resolveOrchestratorGuideEventCity(
  activityLocation?: string,
  fetchedActivityLocation?: string,
): string | undefined {
  return eventCityFromLocation(activityLocation ?? fetchedActivityLocation);
}
