import Taro from '@tarojs/taro';
import type { TranslateParams } from '@/i18n';
import { APP_DISPLAY_NAME, LEGAL_CONSENT_VERSION } from '@/legal/constants';

type TranslateFn = (key: string, params?: TranslateParams) => string;

/** WeChat only fills miniProgram.version on trial/release uploads; develop is empty. */
export function resolveAboutPageVersionLabel(t: TranslateFn): string {
  try {
    const miniProgram = Taro.getAccountInfoSync()?.miniProgram;
    const version = miniProgram?.version?.trim();
    if (version) {
      return t('plur.about.version', { version });
    }
    if (miniProgram?.envVersion === 'trial') {
      return t('plur.about.versionTrial');
    }
    return t('plur.about.versionDevelop');
  } catch {
    return t('plur.about.versionDevelop');
  }
}

/** App content sync stamp shown under the mini-program build label on About. */
export function resolveAboutPageSyncMetaLabel(t: TranslateFn): string {
  return t('legal.meta', {
    app: APP_DISPLAY_NAME,
    date: t('legal.updatedLabel'),
    version: LEGAL_CONSENT_VERSION,
  });
}
