import Taro from '@tarojs/taro';

const ONBOARDING_SEEN_KEY = 'sync:new-user-onboarding:v1';

export function hasSeenNewUserOnboarding(): boolean {
  try {
    return Taro.getStorageSync(ONBOARDING_SEEN_KEY) === true;
  } catch {
    return false;
  }
}

export function markNewUserOnboardingSeen(): void {
  try {
    Taro.setStorageSync(ONBOARDING_SEEN_KEY, true);
  } catch {
    // storage unavailable
  }
}

export function clearNewUserOnboardingSeen(): void {
  try {
    Taro.removeStorageSync(ONBOARDING_SEEN_KEY);
  } catch {
    // ignore
  }
}
