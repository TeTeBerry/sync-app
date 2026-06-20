import type { AppLocale } from '../types';
import { zhCN } from './zh-CN';

type MessageBundle = typeof zhCN;

const loadedMessages: Partial<Record<AppLocale, MessageBundle>> = {
  'zh-CN': zhCN,
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
