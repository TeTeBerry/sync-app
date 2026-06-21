import Taro from '@tarojs/taro';

const STORAGE_KEY = 'sync:events:search-query-intent';

export function setEventsSearchQuery(query: string): void {
  try {
    Taro.setStorageSync(STORAGE_KEY, query.trim());
  } catch {
    // ignore quota / privacy mode
  }
}

/** Read once when the events tab page is shown (e.g. after switchTab from home). */
export function consumeEventsSearchQuery(): string | null {
  try {
    const value = Taro.getStorageSync(STORAGE_KEY);
    Taro.removeStorageSync(STORAGE_KEY);
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    }
  } catch {
    // ignore
  }
  return null;
}
