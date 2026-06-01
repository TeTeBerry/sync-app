import Taro from '@tarojs/taro';

export const PROFILE_STORAGE_KEYS = {
  notifications: 'profile.notificationsEnabled',
  privacy: 'profile.privacyLevel',
} as const;

export type ProfilePrivacyLevel = 'public' | 'friends' | 'private';

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = Taro.getStorageSync(key);
    return raw !== '' && raw != null ? (raw as T) : fallback;
  } catch {
    return fallback;
  }
}

export function readProfileNotificationsEnabled(fallback = true): boolean {
  try {
    const raw = Taro.getStorageSync(PROFILE_STORAGE_KEYS.notifications);
    if (raw === '') return fallback;
    return Boolean(raw);
  } catch {
    return fallback;
  }
}

export function readProfilePrivacyLevel(
  fallback: ProfilePrivacyLevel = 'public',
): ProfilePrivacyLevel {
  return readStorage<ProfilePrivacyLevel>(PROFILE_STORAGE_KEYS.privacy, fallback);
}

export function writeProfileNotificationsEnabled(value: boolean): void {
  Taro.setStorageSync(PROFILE_STORAGE_KEYS.notifications, value);
}

export function writeProfilePrivacyLevel(value: ProfilePrivacyLevel): void {
  Taro.setStorageSync(PROFILE_STORAGE_KEYS.privacy, value);
}
