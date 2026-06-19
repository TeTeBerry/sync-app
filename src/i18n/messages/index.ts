import type { AppLocale } from '../types';
import { zhCN } from './zh-CN';
import { enUS } from './en-US';

export const messages: Record<AppLocale, typeof zhCN> = {
  'zh-CN': zhCN,
  'en-US': enUS,
};
