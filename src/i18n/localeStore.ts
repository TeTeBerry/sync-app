import { create } from 'zustand';
import type { AppLocale } from './types';
import { DEFAULT_LOCALE } from './types';
import {
  readStoredLocale,
  writeStoredLocale,
  shouldUseBrowserLanguageDetection,
} from './localeStorage';
import { loadMessages } from './messages';

type LocaleStatus = 'loading' | 'loaded' | 'error';

// Helper function to detect browser language
function detectBrowserLanguage(): AppLocale {
  try {
    // Check if navigator.language is available
    if (typeof navigator !== 'undefined' && navigator.language) {
      const browserLang = navigator.language.toLowerCase();

      // Map browser language codes to supported locales
      if (browserLang.startsWith('zh') || browserLang.startsWith('cn')) {
        return 'zh-CN';
      }
      if (browserLang.startsWith('en')) {
        return 'en-US';
      }
    }
  } catch (error) {
    console.warn('Failed to detect browser language:', error);
  }

  // Default fallback
  return 'zh-CN';
}

// Helper function to get preferred locale with priority:
// 1. User stored preference
// 2. Browser language (if enabled)
// 3. Default locale
function getPreferredLocale(): AppLocale {
  // First, check if there's a stored preference
  const storedLocale = readStoredLocale();
  if (storedLocale !== 'zh-CN') {
    return storedLocale;
  }

  // Only use browser language detection if enabled
  if (shouldUseBrowserLanguageDetection()) {
    const detectedLocale = detectBrowserLanguage();
    if (detectedLocale !== 'zh-CN') {
      return detectedLocale;
    }
  }

  // Fall back to default
  return 'zh-CN';
}

type LocaleState = {
  // User preferences
  locale: AppLocale;

  // Application state
  hydrated: boolean;
  status: LocaleStatus;
  error: string | null;
  messagesReady: boolean;

  // Batch operations
  isChangingLocale: boolean;

  // Actions
  hydrate: () => void;
  setLocale: (locale: AppLocale) => Promise<void>;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Batch actions
  startLocaleChange: () => void;
  finishLocaleChange: () => void;

  // Browser language detection
  detectBrowserLanguage: () => AppLocale;
  getPreferredLocale: () => AppLocale;
};

export const useLocaleStore = create<LocaleState>((set, get) => ({
  // Stay on default until hydrate loads the preferred bundle (avoids en-US without messages).
  locale: DEFAULT_LOCALE,
  hydrated: false,
  status: 'loading',
  error: null,
  messagesReady: true,
  isChangingLocale: false,

  // Hydration from persistent storage with browser language detection
  hydrate: () => {
    try {
      const preferredLocale = getPreferredLocale();

      set({
        status: 'loading',
        error: null,
      });

      void loadMessages(preferredLocale)
        .then(async () => {
          const { clearTranslationCache } = await import('./translate');
          clearTranslationCache();
          set({
            locale: preferredLocale,
            hydrated: true,
            status: 'loaded',
            messagesReady: true,
            error: null,
          });

          const storedLocale = readStoredLocale();
          if (storedLocale !== preferredLocale && storedLocale !== 'zh-CN') {
            console.log(
              `Browser language (${preferredLocale}) differs from stored preference (${storedLocale})`,
            );
          }
        })
        .catch((error) => {
          console.error('Failed to load messages:', error);
          set({
            locale: DEFAULT_LOCALE,
            hydrated: true,
            status: 'error',
            error: error.message,
            messagesReady: true,
          });
        });
    } catch (error) {
      console.error('Failed to hydrate locale:', error);
      set({
        hydrated: true,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        messagesReady: true,
      });
    }
  },

  // Set locale with better error handling and batching
  setLocale: async (locale) => {
    const { startLocaleChange, finishLocaleChange, setError } = get();
    const previousLocale = get().locale;

    try {
      startLocaleChange();
      setError(null);
      writeStoredLocale(locale);

      await loadMessages(locale);

      const { clearTranslationCache } = await import('./translate');
      clearTranslationCache();

      set({
        locale,
        status: 'loaded',
        messagesReady: true,
        error: null,
      });
    } catch (error) {
      console.error('Failed to set locale:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to change language';
      setError(errorMessage);

      writeStoredLocale(previousLocale);
      set({
        locale: previousLocale,
        status: 'loaded',
        messagesReady: true,
      });
    } finally {
      finishLocaleChange();
    }
  },

  // Helper actions
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Batch operation helpers
  startLocaleChange: () => set({ isChangingLocale: true }),
  finishLocaleChange: () => set({ isChangingLocale: false }),

  // Browser language detection helpers
  detectBrowserLanguage,
  getPreferredLocale,
}));
