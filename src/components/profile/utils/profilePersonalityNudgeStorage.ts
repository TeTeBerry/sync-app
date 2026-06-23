import Taro from '@tarojs/taro';

const STORAGE_KEY = 'sync.profile.personalityNudgeDismissedAt';
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type DismissRecord = {
  userId: string;
  dismissedAt: string;
};

function readRecord(): DismissRecord | null {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY) as DismissRecord | undefined;
    if (!raw || typeof raw !== 'object') return null;
    if (typeof raw.userId !== 'string' || typeof raw.dismissedAt !== 'string') {
      return null;
    }
    return raw;
  } catch {
    return null;
  }
}

export function isProfilePersonalityNudgeDismissed(userId: string): boolean {
  const uid = userId.trim();
  if (!uid) return false;

  const record = readRecord();
  if (!record || record.userId !== uid) return false;

  const dismissedAt = Date.parse(record.dismissedAt);
  if (!Number.isFinite(dismissedAt)) return false;

  return Date.now() - dismissedAt < DISMISS_TTL_MS;
}

export function dismissProfilePersonalityNudge(userId: string): void {
  const uid = userId.trim();
  if (!uid) return;

  const record: DismissRecord = {
    userId: uid,
    dismissedAt: new Date().toISOString(),
  };
  Taro.setStorageSync(STORAGE_KEY, record);
}

export function clearProfilePersonalityNudgeDismiss(userId: string): void {
  const uid = userId.trim();
  if (!uid) return;

  const record = readRecord();
  if (record?.userId === uid) {
    Taro.removeStorageSync(STORAGE_KEY);
  }
}
