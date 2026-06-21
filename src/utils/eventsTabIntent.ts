import Taro from '@tarojs/taro';

export type EventsViewTab = 'calendar' | 'artists' | 'list';

const STORAGE_KEY = 'sync:events:view-tab-intent';

export function setEventsViewTabIntent(tab: EventsViewTab): void {
  try {
    Taro.setStorageSync(STORAGE_KEY, tab);
  } catch {
    // ignore quota / privacy mode
  }
}

/** Read once when the events tab page is shown (e.g. after switchTab from home). */
export function consumeEventsViewTabIntent(): EventsViewTab | null {
  try {
    const value = Taro.getStorageSync(STORAGE_KEY);
    Taro.removeStorageSync(STORAGE_KEY);
    if (value === 'calendar' || value === 'artists' || value === 'list') {
      return value;
    }
  } catch {
    // ignore
  }
  return null;
}
