import Taro from '@tarojs/taro';
import type { AppLocale } from './types';
import { APP_LOCALES, DEFAULT_LOCALE } from './types';

const STORAGE_KEY = 'sync_app_locale';

export function readStoredLocale(): AppLocale {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY);
    if (raw === 'en-US' || raw === 'zh-CN') {
      return raw;
    }
  } catch {
    // ignore
  }
  return DEFAULT_LOCALE;
}

export function writeStoredLocale(locale: AppLocale): void {
  Taro.setStorageSync(STORAGE_KEY, locale);
}

export function isAppLocale(value: string): value is AppLocale {
  return (APP_LOCALES as readonly string[]).includes(value);
}
