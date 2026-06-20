import { fetchHomeSummary } from '../api/sync/activities';
import { fetchProfileSummary } from '../api/sync/profile';
import { isLiveApi } from '../constants/api';
import { isWeappCloudRunTransportEnabled } from '../constants/cloud';
import { getCacheData, prefetchToCache } from '../hooks/useApiQuery';
import { seedActivityDetailsFromHomeSummary } from './activityDetailCache';
import { withCatalogHomeSummary } from './activityCatalog';
import { apiGet } from './apiClient';
import { isLoggedIn } from './authStorage';
import { persistHomeSummary, persistProfileSummary } from './homeCacheStorage';

/** Wake Cloud Run container before user-facing requests (experience build cold start). */
export async function warmCloudRunContainer(): Promise<void> {
  if (!isWeappCloudRunTransportEnabled()) {
    return;
  }
  try {
    await apiGet('/health', undefined, { timeoutMs: 8_000, maxRetries: 0 });
  } catch {
    // Best-effort; first user request may still pay cold-start cost.
  }
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

/** Start core GETs during `useLaunch` so tab pages paint from cache sooner. */
export function prefetchCoreQueriesOnLaunch(): void {
  if (!isLiveApi()) {
    return;
  }

  void warmCloudRunContainer();

  if (!getCacheData(['home', 'summary'])) {
    void prefetchToCache(['home', 'summary'], async () => {
      const result = withCatalogHomeSummary(await fetchHomeSummary());
      persistHomeSummary(result);
      seedActivityDetailsFromHomeSummary(result);
      return result;
    });
  }

  prefetchProfileSummaryIfMissing();
}

/** Call after silent login so profile cache warms without waiting for tab open. */
export function prefetchProfileIfMissing(): void {
  prefetchProfileSummaryIfMissing();
}
