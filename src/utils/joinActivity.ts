import Taro from '@tarojs/taro';
import { registerForActivityAndInvalidate } from '../hooks/sync/activities';
import { isApiEnabled } from '../constants/api';
import type { LoginInterceptFeature } from '../stores/loginInterceptStore';
import { getApiErrorMessage } from './apiErrorMessage';
import { requireAuth } from './authGate';
import {
  BUDDY_GUIDE_AFTER_JOIN_CONFIRM,
  BUDDY_GUIDE_AFTER_JOIN_MESSAGE,
  BUDDY_GUIDE_AFTER_JOIN_TITLE,
  promptBuddyGuideAfterJoin,
  type BuddyGuideConfirm,
} from './buddyGuideAfterJoin';

export type RegisterForActivityResult = {
  ok: boolean;
  alreadyRegistered: boolean;
};

export async function registerForActivityWithFeedback(
  legacyId: number,
): Promise<RegisterForActivityResult> {
  if (!Number.isFinite(legacyId) || legacyId <= 0) {
    return { ok: false, alreadyRegistered: false };
  }

  if (!isApiEnabled()) {
    void Taro.showToast({ title: '请配置 API 地址', icon: 'none' });
    return { ok: false, alreadyRegistered: false };
  }

  try {
    const result = await registerForActivityAndInvalidate(legacyId);
    const alreadyRegistered = result.alreadyRegistered === true;
    if (!alreadyRegistered) {
      void Taro.showToast({
        title: '已报名本场活动',
        icon: 'success',
      });
    }
    return { ok: true, alreadyRegistered };
  } catch (error) {
    void Taro.showToast({
      title: getApiErrorMessage(error, '报名失败，请稍后重试'),
      icon: 'none',
    });
    return { ok: false, alreadyRegistered: false };
  }
}

async function resolveBuddyGuideNavigation(options?: {
  buddyGuide?: boolean;
  confirm?: BuddyGuideConfirm;
  onSuccess?: () => void;
}): Promise<void> {
  if (options?.buddyGuide === false) {
    options.onSuccess?.();
    return;
  }

  if (options?.confirm) {
    const goNow = await promptBuddyGuideAfterJoin(options.confirm);
    if (goNow) {
      options.onSuccess?.();
    }
    return;
  }

  const modal = await Taro.showModal({
    title: BUDDY_GUIDE_AFTER_JOIN_TITLE,
    content: BUDDY_GUIDE_AFTER_JOIN_MESSAGE,
    confirmText: BUDDY_GUIDE_AFTER_JOIN_CONFIRM,
    cancelText: '稍后再说',
  });
  if (modal.confirm) {
    options?.onSuccess?.();
  }
}

export function joinActivityWithAuth(
  legacyId: number,
  options?: {
    onSuccess?: () => void;
    feature?: LoginInterceptFeature;
    /** 本地已展示「已加入」时跳过报名请求与提示，仅执行 onSuccess */
    alreadyJoined?: boolean;
    /** 首次报名成功后引导查看结伴帖（默认 true） */
    buddyGuide?: boolean;
    confirm?: BuddyGuideConfirm;
  },
): void {
  requireAuth(() => {
    if (options?.alreadyJoined) {
      options.onSuccess?.();
      return;
    }
    void registerForActivityWithFeedback(legacyId).then(async (result) => {
      if (!result.ok) {
        return;
      }
      if (result.alreadyRegistered) {
        options?.onSuccess?.();
        return;
      }
      await resolveBuddyGuideNavigation(options);
    });
  }, options?.feature ?? 'general');
}
