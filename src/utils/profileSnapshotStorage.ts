import Taro from '@tarojs/taro';
import { decryptJson, encryptJson } from './encryptedStorage';
import { getClientUserId } from './session';

export interface LocalProfileSnapshot {
  city?: string;
  favorGenres?: string[];
  budgetLevel?: string;
  notificationsEnabled?: boolean;
  updatedAt: string;
}

const STORAGE_KEY = 'profile.encryptedSnapshot';

export async function saveEncryptedProfileSnapshot(
  snapshot: Omit<LocalProfileSnapshot, 'updatedAt'>,
): Promise<void> {
  const payload: LocalProfileSnapshot = {
    ...snapshot,
    updatedAt: new Date().toISOString(),
  };

  const encrypted = await encryptJson(getClientUserId(), payload);
  if (encrypted) {
    Taro.setStorageSync(STORAGE_KEY, encrypted);
    return;
  }

  Taro.setStorageSync(STORAGE_KEY, JSON.stringify(payload));
}

export async function loadEncryptedProfileSnapshot(): Promise<LocalProfileSnapshot | null> {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY);
    if (!raw) return null;

    if (typeof raw === 'string' && raw.startsWith('{')) {
      const parsed = JSON.parse(raw) as LocalProfileSnapshot;
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }

    if (typeof raw === 'string') {
      return decryptJson<LocalProfileSnapshot>(getClientUserId(), raw);
    }
  } catch {
    return null;
  }

  return null;
}
