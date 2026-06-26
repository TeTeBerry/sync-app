import Taro from '@tarojs/taro';

const STORAGE_KEY = 'plurRespectConfirmed';

export function isPlurRespectConfirmed(): boolean {
  try {
    return Taro.getStorageSync(STORAGE_KEY) === true;
  } catch {
    return false;
  }
}

export function setPlurRespectConfirmed(confirmed: boolean): void {
  try {
    if (confirmed) {
      Taro.setStorageSync(STORAGE_KEY, true);
      return;
    }
    Taro.removeStorageSync(STORAGE_KEY);
  } catch {
    // ignore storage failures
  }
}
