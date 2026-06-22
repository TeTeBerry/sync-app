import Taro from '@tarojs/taro';

const PENDING_PREFIX = 'sync:tg-search-prefill-pending:';
const DISMISS_PREFIX = 'sync:tg-search-prefill-dismiss:';

type PendingRecord = {
  guideId: string;
  markedAt: string;
};

function pendingKey(activityLegacyId: number): string {
  return `${PENDING_PREFIX}${activityLegacyId}`;
}

function dismissKey(activityLegacyId: number): string {
  return `${DISMISS_PREFIX}${activityLegacyId}`;
}

export function markTravelGuideSearchPrefillPending(
  activityLegacyId: number,
  guideId: string,
): void {
  const id = guideId.trim();
  if (!Number.isFinite(activityLegacyId) || activityLegacyId <= 0 || !id) {
    return;
  }
  const record: PendingRecord = {
    guideId: id,
    markedAt: new Date().toISOString(),
  };
  Taro.setStorageSync(pendingKey(activityLegacyId), record);
}

export function shouldApplyTravelGuideSearchPrefill(
  activityLegacyId: number,
  guideId: string,
): boolean {
  const id = guideId.trim();
  if (!Number.isFinite(activityLegacyId) || activityLegacyId <= 0 || !id) {
    return false;
  }

  try {
    const pending = Taro.getStorageSync(pendingKey(activityLegacyId)) as
      | PendingRecord
      | undefined;
    if (pending?.guideId !== id) return false;

    const dismissed = Taro.getStorageSync(dismissKey(activityLegacyId)) as
      | string
      | undefined;
    return dismissed !== id;
  } catch {
    return false;
  }
}

export function dismissTravelGuideSearchPrefill(
  activityLegacyId: number,
  guideId: string,
): void {
  const id = guideId.trim();
  if (!Number.isFinite(activityLegacyId) || activityLegacyId <= 0 || !id) {
    return;
  }
  Taro.setStorageSync(dismissKey(activityLegacyId), id);
}
