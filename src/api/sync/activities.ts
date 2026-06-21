import { ApiError, apiGet, apiPost } from '../../utils/apiClient';
import { getActivityTypeLabel } from '../../constants/activityType';
import type {
  ActivityRegistrationResult,
  BackendActivity,
  CatalogLineupArtist,
  HomeSummary,
} from '../../types/backend';
import { ownerQueryParams } from '../requestContext';

export function fetchActivities() {
  return apiGet<BackendActivity[]>('/activities');
}

export function fetchCatalogLineupArtists() {
  return apiGet<CatalogLineupArtist[]>('/activities/lineup-artists');
}

export function resolveActivityByKeyword(keyword: string) {
  return apiGet<BackendActivity | null>('/activities/resolve', { keyword });
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
    return await apiGet<HomeSummary>('/home', ownerQueryParams());
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      return fetchHomeSummaryFromPublicCatalog();
    }
    throw error;
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
