import Taro from '@tarojs/taro';
import {
  broadcastCacheData,
  getCacheKey,
  setCacheDataByKey,
} from '../hooks/useApiQuery';
import { isLiveApi } from '../constants/api';
import { seedActivityDetailCache } from './activityDetailCache';
import { getActivityStatusFromActivity } from './activityStatus';
import type {
  BackendActivity,
  ItineraryScheduleSnapshot,
  SavedItineraryResult,
} from '../types/backend';

export const PERFORMANCE_BUNDLE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
export const PERFORMANCE_BUNDLE_MAX_ACTIVITIES = 5;

const INDEX_STORAGE_KEY = 'sync:performance-bundle:index:v1';

type BundleEnvelope = {
  savedAt: number;
  data: ActivityPerformanceBundle;
};

export type ActivityPerformanceBundle = {
  activityLegacyId: number;
  activity?: BackendActivity | null;
  schedule?: ItineraryScheduleSnapshot;
  savedItinerary?: SavedItineraryResult;
};

type BundleIndexEntry = {
  activityLegacyId: number;
  savedAt: number;
};

function bundleStorageKey(activityLegacyId: number): string {
  return `sync:performance-bundle:${activityLegacyId}:v1`;
}

function defaultScheduleQueryKey(activityLegacyId: number) {
  return ['itinerary', 'schedule', activityLegacyId, undefined, ''] as const;
}

function readRawEnvelope(storageKey: string): BundleEnvelope | undefined {
  try {
    const raw = Taro.getStorageSync(storageKey);
    if (!raw) return undefined;
    const parsed =
      typeof raw === 'string'
        ? (JSON.parse(raw) as BundleEnvelope)
        : (raw as BundleEnvelope);
    if (!parsed?.data || typeof parsed.savedAt !== 'number') {
      return undefined;
    }
    return parsed;
  } catch {
    return undefined;
  }
}

function readIndex(): BundleIndexEntry[] {
  try {
    const raw = Taro.getStorageSync(INDEX_STORAGE_KEY);
    if (!raw) return [];
    const parsed =
      typeof raw === 'string'
        ? (JSON.parse(raw) as BundleIndexEntry[])
        : (raw as BundleIndexEntry[]);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry) =>
        entry &&
        typeof entry.activityLegacyId === 'number' &&
        typeof entry.savedAt === 'number',
    );
  } catch {
    return [];
  }
}

function writeIndex(entries: BundleIndexEntry[]): void {
  try {
    Taro.setStorageSync(INDEX_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // storage full or unavailable
  }
}

function isBundleActivityEnded(bundle: ActivityPerformanceBundle): boolean {
  const date = bundle.activity?.date;
  const title = bundle.activity?.name ?? bundle.schedule?.eventMeta;
  if (!date && !title) {
    return false;
  }
  return getActivityStatusFromActivity(date, title) === 'ended';
}

function isEnvelopeValid(envelope: BundleEnvelope): boolean {
  if (Date.now() - envelope.savedAt > PERFORMANCE_BUNDLE_MAX_AGE_MS) {
    return false;
  }
  if (isBundleActivityEnded(envelope.data)) {
    return false;
  }
  return true;
}

function touchIndex(activityLegacyId: number, savedAt: number): void {
  const next = readIndex().filter(
    (entry) => entry.activityLegacyId !== activityLegacyId,
  );
  next.unshift({ activityLegacyId, savedAt });

  while (next.length > PERFORMANCE_BUNDLE_MAX_ACTIVITIES) {
    const evicted = next.pop();
    if (evicted) {
      try {
        Taro.removeStorageSync(bundleStorageKey(evicted.activityLegacyId));
      } catch {
        // storage unavailable
      }
    }
  }

  writeIndex(next);
}

function removeFromIndex(activityLegacyId: number): void {
  writeIndex(
    readIndex().filter((entry) => entry.activityLegacyId !== activityLegacyId),
  );
}

function writeBundleEnvelope(
  activityLegacyId: number,
  bundle: ActivityPerformanceBundle,
): number {
  const savedAt = Date.now();
  try {
    const payload: BundleEnvelope = { savedAt, data: bundle };
    Taro.setStorageSync(bundleStorageKey(activityLegacyId), JSON.stringify(payload));
    touchIndex(activityLegacyId, savedAt);
  } catch {
    // storage full or unavailable
  }
  return savedAt;
}

function hydrateBundleEnvelope(envelope: BundleEnvelope): void {
  const { data: bundle, savedAt } = envelope;
  const { activityLegacyId } = bundle;

  if (bundle.activity != null) {
    setCacheDataByKey(
      getCacheKey(['activities', 'detail', activityLegacyId]),
      bundle.activity,
      savedAt,
    );
    seedActivityDetailCache(bundle.activity);
  }

  if (bundle.schedule != null) {
    setCacheDataByKey(
      getCacheKey([...defaultScheduleQueryKey(activityLegacyId)]),
      bundle.schedule,
      savedAt,
    );
    broadcastCacheData([...defaultScheduleQueryKey(activityLegacyId)]);
  }

  if (bundle.savedItinerary != null) {
    setCacheDataByKey(
      getCacheKey(['itinerary', 'saved', activityLegacyId]),
      bundle.savedItinerary,
      savedAt,
    );
    broadcastCacheData(['itinerary', 'saved', activityLegacyId]);
  }
}

export type LoadedActivityPerformanceBundle = {
  bundle: ActivityPerformanceBundle;
  savedAt: number;
};

export function loadActivityPerformanceBundle(
  activityLegacyId: number,
): LoadedActivityPerformanceBundle | undefined {
  if (!Number.isFinite(activityLegacyId) || activityLegacyId <= 0) {
    return undefined;
  }

  const envelope = readRawEnvelope(bundleStorageKey(activityLegacyId));
  if (!envelope) {
    return undefined;
  }

  if (!isEnvelopeValid(envelope)) {
    clearActivityPerformanceBundle(activityLegacyId);
    return undefined;
  }

  return { bundle: envelope.data, savedAt: envelope.savedAt };
}

export function saveActivityPerformanceBundle(bundle: ActivityPerformanceBundle): void {
  if (!isLiveApi()) {
    return;
  }

  const activityLegacyId = bundle.activityLegacyId;
  if (!Number.isFinite(activityLegacyId) || activityLegacyId <= 0) {
    return;
  }

  const existing = readRawEnvelope(bundleStorageKey(activityLegacyId));
  const merged: ActivityPerformanceBundle = {
    activityLegacyId,
    activity: bundle.activity ?? existing?.data.activity,
    schedule: bundle.schedule ?? existing?.data.schedule,
    savedItinerary: bundle.savedItinerary ?? existing?.data.savedItinerary,
  };

  if (
    merged.activity == null &&
    merged.schedule == null &&
    merged.savedItinerary == null
  ) {
    return;
  }

  writeBundleEnvelope(activityLegacyId, merged);
}

export function commitActivityPerformanceBundle(
  partial: ActivityPerformanceBundle,
): void {
  saveActivityPerformanceBundle(partial);
}

export function clearActivityPerformanceBundle(activityLegacyId: number): void {
  try {
    Taro.removeStorageSync(bundleStorageKey(activityLegacyId));
  } catch {
    // storage unavailable
  }
  removeFromIndex(activityLegacyId);
}

export function hydrateActivityPerformanceBundlesFromStorage(): void {
  if (!isLiveApi()) {
    return;
  }

  for (const entry of readIndex()) {
    const envelope = readRawEnvelope(bundleStorageKey(entry.activityLegacyId));
    if (!envelope || !isEnvelopeValid(envelope)) {
      clearActivityPerformanceBundle(entry.activityLegacyId);
      continue;
    }
    hydrateBundleEnvelope(envelope);
  }
}
