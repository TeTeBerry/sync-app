import type { AppLocale, MessageTree } from './types';
import { DEFAULT_LOCALE } from './types';
import { ensureDefaultMessagesLoaded, getLoadedMessages } from './messages';
import { LABEL_ALIASES } from './labelAliases';
import { useLocaleStore } from './localeStore';

ensureDefaultMessagesLoaded();

export type TranslateParams = Record<string, string | number>;

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
  const path = key.split('.');
  const value = resolvePath(messageTreeFor(locale) ?? {}, path);
  if (value == null) {
    const fallback = resolvePath(messageTreeFor(DEFAULT_LOCALE) ?? {}, path);
    if (fallback == null) return key;
    return interpolate(fallback, params);
  }
  return interpolate(value, params);
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
