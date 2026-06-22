import Taro from '@tarojs/taro';
import { getAuthUserId } from './authStorage';

const STORAGE_KEY = 'sync_activity_update_subscribe_v1';

type ActivityUpdateSubscribeRecord = {
  userId: string;
  activityLegacyIds: number[];
};

function readRecord(): ActivityUpdateSubscribeRecord | null {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY) as
      | ActivityUpdateSubscribeRecord
      | undefined;
    if (
      !raw ||
      typeof raw.userId !== 'string' ||
      !Array.isArray(raw.activityLegacyIds)
    ) {
      return null;
    }
    return raw;
  } catch {
    return null;
  }
}

function writeRecord(record: ActivityUpdateSubscribeRecord): void {
  try {
    Taro.setStorageSync(STORAGE_KEY, record);
  } catch {
    // best-effort local hint
  }
}

export function isActivityUpdateSubscribedLocally(activityLegacyId: number): boolean {
  const userId = getAuthUserId();
  if (!userId || !Number.isFinite(activityLegacyId) || activityLegacyId <= 0) {
    return false;
  }

  const record = readRecord();
  if (!record || record.userId !== userId) {
    return false;
  }

  return record.activityLegacyIds.includes(activityLegacyId);
}

export function markActivityUpdateSubscribedLocally(activityLegacyId: number): void {
  const userId = getAuthUserId();
  if (!userId || !Number.isFinite(activityLegacyId) || activityLegacyId <= 0) {
    return;
  }

  const record = readRecord();
  const activityLegacyIds =
    record?.userId === userId
      ? [...new Set([...record.activityLegacyIds, activityLegacyId])]
      : [activityLegacyId];

  writeRecord({ userId, activityLegacyIds });
}

export function clearActivityUpdateSubscribedLocally(activityLegacyId: number): void {
  const userId = getAuthUserId();
  if (!userId || !Number.isFinite(activityLegacyId) || activityLegacyId <= 0) {
    return;
  }

  const record = readRecord();
  if (!record || record.userId !== userId) {
    return;
  }

  const activityLegacyIds = record.activityLegacyIds.filter(
    (id) => id !== activityLegacyId,
  );
  writeRecord({ userId, activityLegacyIds });
}
