import { useLocaleStore } from '@/i18n/localeStore';
import type { AppLocale } from '@/i18n/types';

/** Subscribe to locale only — avoids rebuilding `t` when used with getter-based labels. */
export function useLocale(): AppLocale {
  return useLocaleStore((state) => state.locale);
}
