import Taro from '@tarojs/taro';
import type { TranslateParams } from '@/i18n';

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
