import { apiDelete, apiGet, apiPost } from '../../utils/apiClient';
import { LONG_RUNNING_REQUEST_TIMEOUT_MS } from '../../utils/apiClient';
import { getActivityTypeLabel } from '../../constants/activityType';
import type {
  ActivityRegistrationResult,
  ActivityUnregisterResult,
  BackendActivity,
  CatalogLineupArtist,
  CatalogLineupArtistDetail,
  HomeSummary,
} from '../../types/backend';
import { ownerQueryParams } from '../requestContext';

export function fetchActivities() {
  return apiGet<BackendActivity[]>('/activities');
}

export function fetchCatalogLineupArtists() {
  return apiGet<CatalogLineupArtist[]>('/activities/lineup-artists', undefined, {
    timeoutMs: LONG_RUNNING_REQUEST_TIMEOUT_MS,
  });
}

export function fetchCatalogLineupArtistDetail(id: string) {
  return apiGet<CatalogLineupArtistDetail>(`/artists/${encodeURIComponent(id)}`);
}

export function fetchActivitiesByLineupArtistId(lineupArtistId: string) {
  return apiGet<BackendActivity[]>('/activities', { lineupArtistId });
}

function buildHomeSummaryFromCatalog(activities: BackendActivity[]): HomeSummary {
  const signupEvents = activities.map((item) => ({
    id: item.legacyId,
    title: item.name,
    date: item.date ?? '',
    location: item.location ?? '',
    image: item.image ?? '',
    category: getActivityTypeLabel(item.activityType),
    hot: Boolean(item.hot),
    attendees: item.attendees ?? 0,
    going: false,
    region: item.region,
    area: item.area,
  }));

  const people = activities.reduce((sum, item) => sum + (item.attendees ?? 0), 0);

  return {
    signupEvents,
    heat: { people, growthPercent: 0 },
  };
}

/** Compose home feed from public catalog APIs when `/home` is auth-gated. */
async function fetchHomeSummaryFromPublicCatalog(): Promise<HomeSummary> {
  const activities = await fetchActivities();
  return buildHomeSummaryFromCatalog(activities);
}

export async function fetchHomeSummary(): Promise<HomeSummary> {
  try {
    return await apiGet<HomeSummary>('/home', ownerQueryParams(), {
      timeoutMs: 15_000,
    });
  } catch (primaryError) {
    try {
      return await fetchHomeSummaryFromPublicCatalog();
    } catch {
      throw primaryError;
    }
  }
}

export function fetchActivityByLegacyId(legacyId: number) {
  return apiGet<BackendActivity | null>(`/activities/${legacyId}`);
}

export function registerForActivity(legacyId: number) {
  return apiPost<ActivityRegistrationResult>(
    `/activities/${legacyId}/register`,
    {},
    ownerQueryParams(),
  );
}

export function unregisterForActivity(legacyId: number) {
  return apiDelete<ActivityUnregisterResult>(
    `/activities/${legacyId}/register`,
    ownerQueryParams(),
  );
}

export function optInWechatActivityUpdates(legacyId: number) {
  return apiPost<{
    ok: true;
    activityLegacyId: number;
    wechatActivityUpdateOptIn: true;
  }>(`/activities/${legacyId}/register/wechat-updates`, {}, ownerQueryParams());
}
