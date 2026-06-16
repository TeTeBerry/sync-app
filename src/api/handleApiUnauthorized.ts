import Taro from '@tarojs/taro';
import { clearPersonalityTestResult } from '@/domains/personality-test/utils/personalityTestStorage';
import { clearAuthStorage, markSkipAutoLogin } from '../utils/authStorage';
import { notifyAuthSessionChange } from '../utils/authSession';
import { clearClientUserCache } from '../utils/session';

let handlingUnauthorized = false;

/** Clear session and notify UI when an authenticated request returns 401. */
export function handleApiUnauthorized(message?: string): void {
  if (handlingUnauthorized) {
    return;
  }
  handlingUnauthorized = true;
  try {
    clearAuthStorage();
    markSkipAutoLogin();
    clearPersonalityTestResult();
    clearClientUserCache();
    notifyAuthSessionChange();
    void Taro.showToast({
      title: message?.trim() || '登录已过期，请重新登录',
      icon: 'none',
    });
  } finally {
    handlingUnauthorized = false;
  }
}
