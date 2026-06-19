import { create } from 'zustand';
import type { AppLocale } from './types';
import { readStoredLocale, writeStoredLocale } from './localeStorage';

type LocaleState = {
  locale: AppLocale;
  hydrated: boolean;
  hydrate: () => void;
  setLocale: (locale: AppLocale) => void;
};

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: 'zh-CN',
  hydrated: false,
  hydrate: () => {
    const locale = readStoredLocale();
    set({ locale, hydrated: true });
  },
  setLocale: (locale) => {
    writeStoredLocale(locale);
    set({ locale });
  },
}));
