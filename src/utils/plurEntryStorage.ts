import Taro from '@tarojs/taro';
import { hasSeenNewUserOnboarding } from '@/utils/onboardingStorage';

const PLUR_ENTRY_SEEN_KEY = 'sync:plur-entry:v1';

export function hasSeenPlurEntry(): boolean {
  try {
    if (Taro.getStorageSync(PLUR_ENTRY_SEEN_KEY) === true) {
      return true;
    }
    // Grandfather users who completed L2 onboarding before L1 shipped.
    return hasSeenNewUserOnboarding();
  } catch {
    return false;
  }
}

export function markPlurEntrySeen(): void {
  try {
    Taro.setStorageSync(PLUR_ENTRY_SEEN_KEY, true);
  } catch {
    // storage unavailable
  }
}

export function clearPlurEntrySeen(): void {
  try {
    Taro.removeStorageSync(PLUR_ENTRY_SEEN_KEY);
  } catch {
    // ignore
  }
}
