export type AppLocale = 'zh-CN' | 'en-US';

export const APP_LOCALES: readonly AppLocale[] = ['zh-CN', 'en-US'] as const;

export const DEFAULT_LOCALE: AppLocale = 'zh-CN';

export type MessageTree = {
  [key: string]: string | MessageTree;
};
