import Taro from '@tarojs/taro';
import { t, type TranslateParams } from '@/i18n';

export type AppToastIcon = 'success' | 'none' | 'error';

type AppToastOptions = {
  params?: TranslateParams;
  icon?: AppToastIcon;
  duration?: number;
  /** When true, `messageOrKey` is shown verbatim (not passed through `t()`). */
  raw?: boolean;
};

const DEFAULT_DURATION_MS = 2000;

function resolveToastTitle(messageOrKey: string, options?: AppToastOptions): string {
  if (options?.raw) {
    return messageOrKey;
  }
  return t(messageOrKey, options?.params);
}

export function showAppToast(messageKey: string, options?: AppToastOptions): void;
export function showAppToast(message: string, icon?: AppToastIcon): void;
export function showAppToast(
  messageOrKey: string,
  optionsOrIcon?: AppToastOptions | AppToastIcon,
): void {
  if (typeof optionsOrIcon === 'string') {
    void Taro.showToast({
      title: messageOrKey,
      icon: optionsOrIcon,
      duration: DEFAULT_DURATION_MS,
    });
    return;
  }

  void Taro.showToast({
    title: resolveToastTitle(messageOrKey, optionsOrIcon),
    icon: optionsOrIcon?.icon ?? 'none',
    duration: optionsOrIcon?.duration ?? DEFAULT_DURATION_MS,
  });
}
