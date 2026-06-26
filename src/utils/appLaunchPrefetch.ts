import {
  fetchActivities,
  fetchCatalogLineupArtists,
  fetchHomeSummary,
} from '../api/sync/activities';
import { fetchProfileSummary } from '../api/sync/profile';
import { isLiveApi } from '../constants/api';
import { isWeappCloudRunTransportEnabled } from '../constants/cloud';
import { loadPersonalityTestCatalog } from '../domains/personality-test/personalityTestCatalog';
import { prefetchPlurPeaceCoverMedia } from './plurShareImage.util';
import { getCacheData, prefetchToCache } from '../hooks/useApiQuery';
import {
  afterActivitiesListCommitted,
  afterHomeSummaryCommitted,
  persistProfileSummary,
} from './homeCacheStorage';
import { withCatalogActivities, withCatalogHomeSummary } from './activityCatalog';
import { apiGet } from './apiClient';
import { isLoggedIn } from './authStorage';

const LAUNCH_PREFETCH_ATTEMPTS = 3;
const LAUNCH_PREFETCH_RETRY_MS = 400;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Wake Cloud Run container before user-facing requests (experience build cold start). */
export async function warmCloudRunContainer(): Promise<void> {
  if (!isWeappCloudRunTransportEnabled()) {
    return;
  }
  try {
    await apiGet('/health', undefined, { timeoutMs: 12_000, maxRetries: 1 });
  } catch {
    // Best-effort; retried queries below still run.
  }
}

async function prefetchQueryWithRetry<T>(
  queryKey: (string | number | undefined)[],
  queryFn: () => Promise<T>,
): Promise<T | undefined> {
  for (let attempt = 0; attempt < LAUNCH_PREFETCH_ATTEMPTS; attempt += 1) {
    const result = await prefetchToCache(queryKey, queryFn);
    if (result !== undefined) {
      return result;
    }
    if (attempt < LAUNCH_PREFETCH_ATTEMPTS - 1) {
      await sleep(LAUNCH_PREFETCH_RETRY_MS * (attempt + 1));
    }
  }
  return undefined;
}

function prefetchProfileSummaryIfMissing(): void {
  if (!isLiveApi() || !isLoggedIn() || getCacheData(['profile', 'summary'])) {
    return;
  }
  void prefetchToCache(['profile', 'summary'], async () => {
    const summary = await fetchProfileSummary();
    persistProfileSummary(summary);
    return summary;
  });
}

async function prefetchHomeSummaryIfMissing(): Promise<void> {
  if (getCacheData(['home', 'summary'])) {
    return;
  }
  await prefetchQueryWithRetry(['home', 'summary'], async () => {
    const result = withCatalogHomeSummary(await fetchHomeSummary());
    afterHomeSummaryCommitted(result);
    return result;
  });
}

async function prefetchActivitiesIfMissing(): Promise<void> {
  if (getCacheData(['activities'])) {
    return;
  }
  await prefetchQueryWithRetry(['activities'], async () => {
    const activities = withCatalogActivities(await fetchActivities());
    afterActivitiesListCommitted(activities);
    return activities;
  });
}

async function prefetchLineupArtistsIfMissing(): Promise<void> {
  if (getCacheData(['activities', 'lineup-artists'])) {
    return;
  }
  await prefetchQueryWithRetry(
    ['activities', 'lineup-artists'],
    fetchCatalogLineupArtists,
  );
}

/** Start core GETs during `useLaunch` so tab pages paint from cache sooner. */
export async function prefetchCoreQueriesOnLaunch(): Promise<void> {
  if (!isLiveApi()) {
    return;
  }

  await warmCloudRunContainer();
  await prefetchHomeSummaryIfMissing();
  await prefetchActivitiesIfMissing();
  void prefetchLineupArtistsIfMissing();
  void loadPersonalityTestCatalog().catch(() => undefined);
  prefetchPlurPeaceCoverMedia();
  prefetchProfileSummaryIfMissing();
}

/** Call after silent login so profile cache warms without waiting for tab open. */
export function prefetchProfileIfMissing(): void {
  prefetchProfileSummaryIfMissing();
}
