import Taro from '@tarojs/taro';
import type { AiGuidePlanFormValues, TravelGuidePlan } from '@/types/travelGuide';

const STORAGE_PREFIX = 'sync:travel-guide-detail:';
const LATEST_INDEX_PREFIX = 'sync:travel-guide-latest:';

export type TravelGuideDetailPayload = {
  plan: TravelGuidePlan;
  form: AiGuidePlanFormValues;
  activityLegacyId?: number;
  createdAt: string;
};

function latestIndexKey(activityLegacyId: number): string {
  return `${LATEST_INDEX_PREFIX}${activityLegacyId}`;
}

function storageKey(guideId: string): string {
  return `${STORAGE_PREFIX}${guideId.trim()}`;
}

export function saveTravelGuideDetail(
  guideId: string,
  payload: Omit<TravelGuideDetailPayload, 'createdAt'>,
): void {
  const id = guideId.trim();
  if (!id) return;
  const record: TravelGuideDetailPayload = {
    ...payload,
    createdAt: new Date().toISOString(),
  };
  Taro.setStorageSync(storageKey(id), record);
  if (payload.activityLegacyId != null && !Number.isNaN(payload.activityLegacyId)) {
    Taro.setStorageSync(latestIndexKey(payload.activityLegacyId), id);
  }
}

export function loadTravelGuideDetail(
  guideId: string,
): TravelGuideDetailPayload | null {
  const id = guideId.trim();
  if (!id) return null;
  try {
    const raw = Taro.getStorageSync(storageKey(id)) as
      | TravelGuideDetailPayload
      | undefined;
    if (!raw?.plan || !raw.form) return null;
    return raw;
  } catch {
    return null;
  }
}

export function findLatestTravelGuideForActivity(
  activityLegacyId: number,
): (TravelGuideDetailPayload & { guideId: string }) | null {
  if (!Number.isFinite(activityLegacyId) || activityLegacyId <= 0) {
    return null;
  }

  try {
    const indexedId = Taro.getStorageSync(latestIndexKey(activityLegacyId)) as
      | string
      | undefined;
    if (indexedId?.trim()) {
      const indexed = loadTravelGuideDetail(indexedId);
      if (indexed && indexed.activityLegacyId === activityLegacyId) {
        return { ...indexed, guideId: indexedId.trim() };
      }
    }
  } catch {
    // fall through to scan
  }

  try {
    const { keys } = Taro.getStorageInfoSync();
    let latest: (TravelGuideDetailPayload & { guideId: string }) | null = null;

    for (const key of keys) {
      if (!key.startsWith(STORAGE_PREFIX)) continue;
      const guideId = key.slice(STORAGE_PREFIX.length);
      const detail = loadTravelGuideDetail(guideId);
      if (!detail || detail.activityLegacyId !== activityLegacyId) continue;
      if (!latest || Date.parse(detail.createdAt) > Date.parse(latest.createdAt)) {
        latest = { ...detail, guideId };
      }
    }

    if (latest) {
      Taro.setStorageSync(latestIndexKey(activityLegacyId), latest.guideId);
    }
    return latest;
  } catch {
    return null;
  }
}
