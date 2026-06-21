import { useMemo, useRef } from 'react';
import { useLocaleStore } from '@/i18n/localeStore';
import {
  translate,
  getTranslationCacheStats,
  type TranslateParams,
} from '@/i18n/translate';
import type { AppLocale } from '@/i18n/types';

// Memoized selectors to avoid unnecessary re-renders
const localeSelector = (state: ReturnType<typeof useLocaleStore.getState>) =>
  state.locale;
const setLocaleSelector = (state: ReturnType<typeof useLocaleStore.getState>) =>
  state.setLocale;
const statusSelector = (state: ReturnType<typeof useLocaleStore.getState>) =>
  state.status;
const errorSelector = (state: ReturnType<typeof useLocaleStore.getState>) =>
  state.error;
const isChangingLocaleSelector = (state: ReturnType<typeof useLocaleStore.getState>) =>
  state.isChangingLocale;

// Cache for translation functions to avoid recreating them
const translationCache = new Map<AppLocale, ReturnType<typeof createTranslationFn>>();

function createTranslationFn(locale: AppLocale) {
  return (key: string, params?: TranslateParams) => translate(key, locale, params);
}

export function useI18n() {
  // Use selectors to subscribe only to specific parts of the store
  const locale = useLocaleStore(localeSelector);
  const setLocale = useLocaleStore(setLocaleSelector);
  const status = useLocaleStore(statusSelector);
  const error = useLocaleStore(errorSelector);
  const isChangingLocale = useLocaleStore(isChangingLocaleSelector);

  // Memoized translation function
  const t = useMemo(() => {
    // Check if we already have a cached translation function for this locale
    if (translationCache.has(locale)) {
      return translationCache.get(locale)!;
    }

    // Create and cache the translation function
    const translationFn = createTranslationFn(locale);
    translationCache.set(locale, translationFn);
    return translationFn;
  }, [locale]);

  // Return memoized values to prevent unnecessary re-renders
  return useMemo(
    () => ({
      locale,
      setLocale,
      t,
      status,
      error,
      isChangingLocale,
    }),
    [locale, setLocale, t, status, error, isChangingLocale],
  );
}

export function useT() {
  return useI18n().t;
}

export function useLocale() {
  return useLocaleStore(localeSelector);
}

export function useLocaleStatus() {
  return useLocaleStore(statusSelector);
}

export function useLocaleError() {
  return useLocaleStore(errorSelector);
}

export function useIsChangingLocale() {
  return useLocaleStore(isChangingLocaleSelector);
}

// Performance monitoring hook for i18n operations
export function useI18nPerformance() {
  const renderCount = useRef(0);
  renderCount.current++;

  return {
    renderCount: renderCount.current,
    getCacheStats: () => getTranslationCacheStats(),
  };
}

export type { AppLocale, TranslateParams };
