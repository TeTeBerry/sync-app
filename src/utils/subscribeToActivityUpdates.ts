import Taro from '@tarojs/taro';
import { isApiEnabled } from '@/constants/api';
import {
  registerForActivityAndInvalidate,
  unregisterForActivityAndInvalidate,
} from '@/hooks/sync/activities';
import { t } from '@/i18n';
import {
  clearActivityUpdateSubscribedLocally,
  markActivityUpdateSubscribedLocally,
} from './activityUpdateSubscribeStorage';
import { isLoggedIn } from './authStorage';
import {
  isActivityUpdateSubscribeConfigured,
  requestActivityUpdateSubscribe,
  type SubscribeMessageOutcome,
} from './wechatSubscribeMessage';

export type ActivityUpdateSubscribeResult =
  | 'wechat_accepted'
  | 'in_app_only'
  | 'auth_required'
  | 'invalid_activity'
  | 'register_failed';

export type ActivityUpdateUnsubscribeResult =
  | 'success'
  | 'auth_required'
  | 'invalid_activity'
  | 'unregister_failed';

function toastForOutcome(wechatOutcome: SubscribeMessageOutcome): void {
  if (wechatOutcome === 'accepted') {
    void Taro.showToast({
      title: t('itinerary.unpublishedBanner.subscribeSuccessWechat'),
      icon: 'success',
    });
    return;
  }

  void Taro.showToast({
    title: t('itinerary.unpublishedBanner.subscribeSuccessInApp'),
    icon: 'none',
  });
}

/** Register for the activity and request lineup/schedule update notifications. */
export async function subscribeToActivityUpdates(
  activityLegacyId: number,
): Promise<ActivityUpdateSubscribeResult> {
  if (!Number.isFinite(activityLegacyId) || activityLegacyId <= 0) {
    return 'invalid_activity';
  }
  if (!isLoggedIn()) {
    return 'auth_required';
  }

  let registered = false;
  if (isApiEnabled()) {
    try {
      await registerForActivityAndInvalidate(activityLegacyId);
      registered = true;
    } catch {
      void Taro.showToast({
        title: t('itinerary.unpublishedBanner.subscribeRegisterFailed'),
        icon: 'none',
      });
      return 'register_failed';
    }
  }

  const wechatOutcome = await requestActivityUpdateSubscribe();

  if (wechatOutcome === 'accepted') {
    markActivityUpdateSubscribedLocally(activityLegacyId);
    toastForOutcome('accepted');
    return 'wechat_accepted';
  }

  if (registered) {
    markActivityUpdateSubscribedLocally(activityLegacyId);
    toastForOutcome(wechatOutcome);
    return 'in_app_only';
  }

  if (!isActivityUpdateSubscribeConfigured()) {
    void Taro.showToast({
      title: t('itinerary.unpublishedBanner.subscribeUnconfigured'),
      icon: 'none',
    });
  }

  return 'register_failed';
}

/** Clear local follow state and unregister from the activity when possible. */
export async function unsubscribeFromActivityUpdates(
  activityLegacyId: number,
): Promise<ActivityUpdateUnsubscribeResult> {
  if (!Number.isFinite(activityLegacyId) || activityLegacyId <= 0) {
    return 'invalid_activity';
  }
  if (!isLoggedIn()) {
    return 'auth_required';
  }

  clearActivityUpdateSubscribedLocally(activityLegacyId);

  if (isApiEnabled()) {
    try {
      await unregisterForActivityAndInvalidate(activityLegacyId);
    } catch {
      void Taro.showToast({
        title: t('eventCard.unfollowFailed'),
        icon: 'none',
      });
      return 'unregister_failed';
    }
  }

  void Taro.showToast({
    title: t('eventCard.unfollowSuccess'),
    icon: 'none',
  });
  return 'success';
}
