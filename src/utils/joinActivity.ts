import Taro from '@tarojs/taro';
import { registerForActivityAndInvalidate } from '../hooks/sync/activities';
import { isApiEnabled } from '../constants/api';
import type { LoginInterceptFeature } from '../stores/loginInterceptStore';
import { getApiErrorMessage } from './apiErrorMessage';
import { requireAuth } from './authGate';

export async function registerForActivityWithFeedback(
  legacyId: number,
): Promise<boolean> {
  if (!Number.isFinite(legacyId) || legacyId <= 0) {
    return false;
  }

  if (!isApiEnabled()) {
    void Taro.showToast({ title: '已加入本场活动', icon: 'success' });
    return true;
  }

  try {
    const result = await registerForActivityAndInvalidate(legacyId);
    if (!result.alreadyRegistered) {
      void Taro.showToast({
        title: '已报名本场活动',
        icon: 'success',
      });
    }
    return true;
  } catch (error) {
    void Taro.showToast({
      title: getApiErrorMessage(error, '报名失败，请稍后重试'),
      icon: 'none',
    });
    return false;
  }
}

export function joinActivityWithAuth(
  legacyId: number,
  options?: {
    onSuccess?: () => void;
    feature?: LoginInterceptFeature;
    /** 本地已展示「已加入」时跳过报名请求与提示，仅执行 onSuccess */
    alreadyJoined?: boolean;
  },
): void {
  requireAuth(() => {
    if (options?.alreadyJoined) {
      options.onSuccess?.();
      return;
    }
    void registerForActivityWithFeedback(legacyId).then((ok) => {
      if (ok) {
        options?.onSuccess?.();
      }
    });
  }, options?.feature ?? 'general');
}
