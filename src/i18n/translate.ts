import type { AppLocale, MessageTree } from './types';
import { DEFAULT_LOCALE } from './types';
import {
  ensureDefaultMessagesLoaded,
  getLoadedMessages,
  preloadAllHighPriorityTranslations,
  isCommonTranslationKey,
} from './messages';
import { LABEL_ALIASES } from './labelAliases';
import { useLocaleStore } from './localeStore';

ensureDefaultMessagesLoaded();

/** DevTools exposes Web `performance`; WeChat device runtime may not — avoid crashing on `t()`. */
function readMonotonicTime(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}

export type TranslateParams = Record<string, string | number>;

interface CacheEntry {
  value: string;
  timestamp: number;
  hitCount: number;
}

class TranslationCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number;
  private stats = {
    hits: 0,
    misses: 0,
    totalCalls: 0,
    avgLookupTime: 0,
    lookupTimes: [] as number[],
  };

  constructor(maxSize = 200) {
    this.maxSize = maxSize;
  }

  private generateKey(
    key: string,
    locale: AppLocale,
    params?: TranslateParams,
  ): string {
    const paramsStr = params ? JSON.stringify(params) : '';
    return `${locale}:${key}:${paramsStr}`;
  }

  private updateLookupTime(duration: number) {
    this.stats.lookupTimes.push(duration);
    // Keep only the last 100 lookup times for average calculation
    if (this.stats.lookupTimes.length > 100) {
      this.stats.lookupTimes.shift();
    }
    this.stats.avgLookupTime =
      this.stats.lookupTimes.reduce((a, b) => a + b, 0) / this.stats.lookupTimes.length;
  }

  get(key: string, locale: AppLocale, params?: TranslateParams): string | null {
    const startTime = readMonotonicTime();
    this.stats.totalCalls++;

    const cacheKey = this.generateKey(key, locale, params);
    const entry = this.cache.get(cacheKey);

    if (entry) {
      entry.hitCount++;
      entry.timestamp = Date.now();
      this.stats.hits++;
      this.updateLookupTime(readMonotonicTime() - startTime);
      return entry.value;
    }

    this.stats.misses++;
    this.updateLookupTime(readMonotonicTime() - startTime);
    return null;
  }

  set(key: string, locale: AppLocale, value: string, params?: TranslateParams): void {
    const cacheKey = this.generateKey(key, locale, params);

    // If cache is full, remove the least recently used item
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(cacheKey, {
      value,
      timestamp: Date.now(),
      hitCount: 0,
    });
  }

  clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      totalCalls: 0,
      avgLookupTime: 0,
      lookupTimes: [],
    };
  }

  invalidateLocale(locale: AppLocale): void {
    const keysToDelete: string[] = [];

    for (const cacheKey of this.cache.keys()) {
      if (cacheKey.startsWith(`${locale}:`)) {
        keysToDelete.push(cacheKey);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  getStats() {
    const hitRate =
      this.stats.totalCalls > 0
        ? ((this.stats.hits / this.stats.totalCalls) * 100).toFixed(2)
        : '0.00';

    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      cacheSize: this.cache.size,
      maxSize: this.maxSize,
    };
  }
}

// Global cache instance
const translationCache = new TranslationCache();

// Track if high priority translations are preloaded
const highPriorityPreloaded = new Set<AppLocale>();

function resolvePath(tree: MessageTree, path: string[]): string | undefined {
  let node: string | MessageTree | undefined = tree;
  for (const segment of path) {
    if (typeof node !== 'object' || node == null) {
      return undefined;
    }
    node = node[segment];
  }
  return typeof node === 'string' ? node : undefined;
}

function interpolate(template: string, params?: TranslateParams): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) =>
    String(params[key] ?? ''),
  );
}

function messageTreeFor(locale: AppLocale): MessageTree | undefined {
  return getLoadedMessages(locale);
}

export function translate(
  key: string,
  locale: AppLocale = DEFAULT_LOCALE,
  params?: TranslateParams,
): string {
  // First, check the cache
  const cachedValue = translationCache.get(key, locale, params);
  if (cachedValue !== null) {
    return cachedValue;
  }

  // If not in cache, compute the value
  const path = key.split('.');
  let value = resolvePath(messageTreeFor(locale) ?? {}, path);

  if (value == null) {
    const fallback = resolvePath(messageTreeFor(DEFAULT_LOCALE) ?? {}, path);
    if (fallback == null) {
      translationCache.set(key, locale, key, params);
      return key;
    }
    value = interpolate(fallback, params);
  } else {
    value = interpolate(value, params);
  }

  // Cache the computed value
  translationCache.set(key, locale, value, params);

  // If this is a common translation key and we haven't preloaded high priority translations for this locale yet
  if (isCommonTranslationKey(key) && !highPriorityPreloaded.has(locale)) {
    // Preload high priority translations for this locale in the background
    void preloadAllHighPriorityTranslations(locale).then(() => {
      highPriorityPreloaded.add(locale);
    });
  }

  return value;
}

/**
 * Get cache statistics for performance monitoring
 */
export function getTranslationCacheStats() {
  return translationCache.getStats();
}

/**
 * Clear the translation cache
 */
export function clearTranslationCache() {
  translationCache.clear();
}

/**
 * Invalidate cache for a specific locale
 */
export function invalidateTranslationCacheForLocale(locale: AppLocale) {
  translationCache.invalidateLocale(locale);
}

/**
 * Preload high priority translations for the current locale
 */
export function preloadHighPriorityTranslations(): Promise<void> {
  const locale = useLocaleStore.getState().locale;
  return preloadAllHighPriorityTranslations(locale);
}

/** Non-React translation using the current locale from the store. */
export function t(key: string, params?: TranslateParams): string {
  const locale = useLocaleStore.getState().locale;
  return translate(key, locale, params);
}

/** Match a UI label against a message key in any supported locale. */
export function labelMatchesKey(label: string, key: string): boolean {
  const trimmed = label.trim();
  if (!trimmed) return false;

  const aliases = LABEL_ALIASES[key];
  if (aliases) {
    return aliases[0] === trimmed || aliases[1] === trimmed;
  }

  return translate(key, 'zh-CN') === trimmed || translate(key, 'en-US') === trimmed;
}
