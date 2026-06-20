import { useCallback } from 'react';
import { useLocaleStore } from '@/i18n/localeStore';
import { translate, type TranslateParams } from '@/i18n/translate';
import type { AppLocale } from '@/i18n/types';

export function useI18n() {
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);

  const t = useCallback(
    (key: string, params?: TranslateParams) => translate(key, locale, params),
    [locale],
  );

  return { locale, setLocale, t };
}

export function useT() {
  return useI18n().t;
}

export type { AppLocale, TranslateParams };
