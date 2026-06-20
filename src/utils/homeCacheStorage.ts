import Taro from '@tarojs/taro';
import {
  broadcastCacheData,
  getCacheKey,
  setCacheData,
  setCacheDataByKey,
} from '../hooks/useApiQuery';
import { isLiveApi } from '../constants/api';
import {
  seedActivityDetailsFromList,
  seedActivityDetailsFromHomeSummary,
} from './activityDetailCache';
import { withCatalogActivities, withCatalogHomeSummary } from './activityCatalog';
import { invalidateHome } from './queryInvalidation';
import type { BackendActivity, HomeSummary, ProfileSummary } from '../types/backend';

export const HOME_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const SUMMARY_STORAGE_KEY = 'sync:home:summary:v2';
const ACTIVITIES_STORAGE_KEY = 'sync:activities:list:v1';
const PROFILE_SUMMARY_STORAGE_KEY = 'sync:profile:summary:v1';

type CacheEnvelope<T> = {
  savedAt: number;
  data: T;
};

function readEnvelope<T>(storageKey: string): CacheEnvelope<T> | undefined {
  try {
    const raw = Taro.getStorageSync(storageKey);
    if (!raw) return undefined;
    const parsed =
      typeof raw === 'string'
        ? (JSON.parse(raw) as CacheEnvelope<T>)
        : (raw as CacheEnvelope<T>);
    if (!parsed?.data || typeof parsed.savedAt !== 'number') {
      return undefined;
    }
    if (Date.now() - parsed.savedAt > HOME_CACHE_MAX_AGE_MS) {
      return undefined;
    }
    return parsed;
  } catch {
    return undefined;
  }
}

function writeEnvelope<T>(storageKey: string, data: T): void {
  try {
    const payload: CacheEnvelope<T> = {
      savedAt: Date.now(),
      data,
    };
    Taro.setStorageSync(storageKey, JSON.stringify(payload));
  } catch {
    // storage full or unavailable
  }
}

export function hydrateAppCachesFromStorage(): void {
  if (!isLiveApi()) {
    return;
  }

  const summaryEnvelope = readEnvelope<HomeSummary>(SUMMARY_STORAGE_KEY);
  if (summaryEnvelope) {
    const summary = withCatalogHomeSummary(summaryEnvelope.data);
    setCacheDataByKey(
      getCacheKey(['home', 'summary']),
      summary,
      summaryEnvelope.savedAt,
    );
    seedActivityDetailsFromHomeSummary(summary);
  }

  const activitiesEnvelope = readEnvelope<BackendActivity[]>(ACTIVITIES_STORAGE_KEY);
  if (activitiesEnvelope?.data?.length) {
    const activities = withCatalogActivities(activitiesEnvelope.data);
    setCacheDataByKey(
      getCacheKey(['activities']),
      activities,
      activitiesEnvelope.savedAt,
    );
    seedActivityDetailsFromList(activities);
  }

  const profileEnvelope = readEnvelope<ProfileSummary>(PROFILE_SUMMARY_STORAGE_KEY);
  if (profileEnvelope) {
    setCacheDataByKey(
      getCacheKey(['profile', 'summary']),
      profileEnvelope.data,
      profileEnvelope.savedAt,
    );
  }
}

export function persistHomeSummary(data: HomeSummary): void {
  if (!isLiveApi()) {
    return;
  }
  writeEnvelope(SUMMARY_STORAGE_KEY, data);
}

export function persistActivities(data: BackendActivity[]): void {
  if (!isLiveApi() || !data.length) {
    return;
  }
  writeEnvelope(ACTIVITIES_STORAGE_KEY, data);
}

export function persistProfileSummary(data: ProfileSummary): void {
  if (!isLiveApi()) {
    return;
  }
  writeEnvelope(PROFILE_SUMMARY_STORAGE_KEY, data);
}

/** Clear persisted home summary (e.g. on logout so `going` is not shown to guests). */
export function clearPersistedHomeSummary(): void {
  try {
    Taro.removeStorageSync(SUMMARY_STORAGE_KEY);
  } catch {
    // storage unavailable
  }
}

export function clearPersistedProfileSummary(): void {
  try {
    Taro.removeStorageSync(PROFILE_SUMMARY_STORAGE_KEY);
  } catch {
    // storage unavailable
  }
}

/** Reset cached `going` flags on home summary after logout. */
export function resetHomeSummaryGoingFlagsInCache(): void {
  setCacheData<HomeSummary>(['home', 'summary'], (prev) => {
    if (!prev?.signupEvents?.length) {
      return prev;
    }
    return {
      ...prev,
      signupEvents: prev.signupEvents.map((event) =>
        event.going ? { ...event, going: false } : event,
      ),
    };
  });
  broadcastCacheData(['home', 'summary']);
}

/** Clear persisted + in-memory home caches on logout (keeps `auth.ts` free of hook imports). */
export function clearHomeCachesOnLogout(): void {
  clearPersistedHomeSummary();
  clearPersistedProfileSummary();
  resetHomeSummaryGoingFlagsInCache();
  invalidateHome();
}
