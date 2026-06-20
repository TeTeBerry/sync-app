import { create } from 'zustand';
import type { AppLocale } from './types';
import { readStoredLocale, writeStoredLocale } from './localeStorage';
import { loadMessages } from './messages';

type LocaleState = {
  locale: AppLocale;
  hydrated: boolean;
  messagesReady: boolean;
  hydrate: () => void;
  setLocale: (locale: AppLocale) => void;
};

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: 'zh-CN',
  hydrated: false,
  messagesReady: true,
  hydrate: () => {
    const locale = readStoredLocale();
    set({ locale, messagesReady: locale === 'zh-CN' });
    void loadMessages(locale).then(() => {
      set({ hydrated: true, messagesReady: true });
    });
  },
  setLocale: (locale) => {
    writeStoredLocale(locale);
    set({ locale, messagesReady: locale === 'zh-CN' });
    void loadMessages(locale).then(() => set({ messagesReady: true }));
  },
}));
