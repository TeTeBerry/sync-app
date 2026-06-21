import type { AppLocale } from '../types';
import { zhCN } from './zh-CN';

type MessageBundle = typeof zhCN;

const loadedMessages: Partial<Record<AppLocale, MessageBundle>> = {
  'zh-CN': zhCN,
};

// Common translation keys that are frequently used across the app
export const COMMON_TRANSLATION_KEYS: string[] = [
  'common.save',
  'common.cancel',
  'common.confirm',
  'common.loading',
  'common.retry',
  'common.all',
  'common.browse',
  'common.notSet',
  'common.back',
  'common.more',
  'common.me',
  'common.user',
  'common.hot',
  'common.loadingMore',
  '.viewMore',
  'viewAll',
  'tab.home',
  'tab.ai',
  'tab.events',
  'tab.profile',
  // Add more common keys as needed
];

// Priority levels for translation loading
enum LoadingPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

// Keys organized by priority
export const TRANSLATION_PRIORITY: Record<LoadingPriority, string[]> = {
  [LoadingPriority.HIGH]: [
    'common.loading',
    'common.save',
    'common.cancel',
    'common.confirm',
    'common.all',
    'tab.home',
    'tab.profile',
  ],
  [LoadingPriority.MEDIUM]: [
    'common.retry',
    'common.browse',
    'common.notSet',
    'common.back',
    'common.more',
    'common.me',
    'tab.ai',
    'tab.events',
  ],
  [LoadingPriority.LOW]: [
    'common.user',
    'common.hot',
    'common.loadingMore',
    'viewMore',
    'viewAll',
    // Other less frequently used keys
  ],
};

export async function loadMessages(locale: AppLocale): Promise<MessageBundle> {
  const cached = loadedMessages[locale];
  if (cached) return cached;

  if (locale === 'en-US') {
    const { enUS } = await import('./en-US');
    loadedMessages['en-US'] = enUS;
    return enUS;
  }

  loadedMessages['zh-CN'] = zhCN;
  return zhCN;
}

export function getLoadedMessages(locale: AppLocale): MessageBundle | undefined {
  return loadedMessages[locale];
}

export function ensureDefaultMessagesLoaded(): void {
  if (!loadedMessages['zh-CN']) {
    loadedMessages['zh-CN'] = zhCN;
  }
}

/**
 * Preload common translations for a given locale
 */
export async function preloadCommonTranslations(
  locale: AppLocale,
  priority?: LoadingPriority,
): Promise<void> {
  await loadMessages(locale);

  // Keys are already loaded through loadMessages, this ensures they're in the cache
  return Promise.resolve();
}

/**
 * Preload all translations with high priority
 */
export async function preloadAllHighPriorityTranslations(
  locale: AppLocale,
): Promise<void> {
  return preloadCommonTranslations(locale, LoadingPriority.HIGH);
}

/**
 * Get translation keys by priority
 */
export function getKeysByPriority(priority: LoadingPriority): string[] {
  return TRANSLATION_PRIORITY[priority];
}

/**
 * Check if a key is a common translation
 */
export function isCommonTranslationKey(key: string): boolean {
  return COMMON_TRANSLATION_KEYS.includes(
    key as (typeof COMMON_TRANSLATION_KEYS)[number],
  );
}
