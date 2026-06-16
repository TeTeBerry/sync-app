import Taro from '@tarojs/taro';
import type { AiGuidePlanFormValues, TravelGuidePlan } from '@/types/travelGuide';

const STORAGE_PREFIX = 'sync:travel-guide-detail:';

export type TravelGuideDetailPayload = {
  plan: TravelGuidePlan;
  form: AiGuidePlanFormValues;
  activityLegacyId?: number;
  createdAt: string;
};

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
