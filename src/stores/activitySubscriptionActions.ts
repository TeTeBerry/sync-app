import {
  createUserGoalAndInvalidate,
  deleteUserGoalAndInvalidate,
} from '@/hooks/sync/goals';
import { fetchUserGoals } from '@/api/sync/goals';
import {
  refreshHomeSummaryFromServer,
  unregisterForActivityAndInvalidate,
} from '@/hooks/sync/activities';
import { refreshProfileActivitiesFromServer } from '@/hooks/sync/profile';
import { fetchProfileActivities } from '@/api/sync/profile';
import { isApiEnabled } from '@/constants/api';
import { isLoggedIn } from '@/utils/authStorage';
import {
  requestActivityUpdateSubscribe,
  type SubscribeMessageOutcome,
} from '@/utils/wechatSubscribeMessage';
import { showAppToast } from '@/utils/appToast';
import { invalidateProfileActivities } from '@/utils/queryInvalidation';
import { invalidateCache } from '@/hooks/useApiQuery';
import {
  patchActivitySelectionInCaches,
  patchProfileActivitiesOnSubscribe,
  patchProfileSummaryOnSelection,
} from '@/cache/activityCache';
import { patchPersistedHomeSummaryGoingFlag } from '@/utils/homeCacheStorage';
import {
  clearActivityWechatOptIn,
  markActivityWechatOptIn,
  useActivitySubscriptionStore,
} from './activitySubscriptionStore';

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
    showAppToast('itinerary.unpublishedBanner.subscribeSuccessWechat', {
      icon: 'success',
    });
    return;
  }

  showAppToast('itinerary.unpublishedBanner.subscribeSuccessInApp', { icon: 'none' });
}

/** Refresh 我的活动 after lineup vote, itinerary save, posts, etc. */
export async function refreshMyActivitiesAfterEngagement(): Promise<void> {
  invalidateProfileActivities();
  invalidateCache(['goals']);
  await hydrateActivitySubscriptionStore();
}

/** Load profile activities + goals into the global subscription store. */
export async function hydrateActivitySubscriptionStore(): Promise<void> {
  if (!isApiEnabled() || !isLoggedIn()) {
    return;
  }

  try {
    const [activities, goals] = await Promise.all([
      fetchProfileActivities(),
      fetchUserGoals(),
    ]);
    useActivitySubscriptionStore.getState().setFromServer(activities, goals);
  } catch {
    // Best-effort; UI falls back to query cache until next hydrate.
  }
}

/** Subscribe via user goal API (registers + optional WeChat opt-in on backend). */
export async function subscribeToActivityUpdates(
  activityLegacyId: number,
): Promise<ActivityUpdateSubscribeResult> {
  if (!Number.isFinite(activityLegacyId) || activityLegacyId <= 0) {
    return 'invalid_activity';
  }
  if (!isLoggedIn()) {
    return 'auth_required';
  }

  const wechatOutcome = await requestActivityUpdateSubscribe();

  if (isApiEnabled()) {
    try {
      const goal = await createUserGoalAndInvalidate({
        activityLegacyId,
        kind: 'watch_lineup',
        params: { notifyWechat: wechatOutcome === 'accepted' },
      });
      const isNewProfileActivity = patchProfileActivitiesOnSubscribe(activityLegacyId);
      patchActivitySelectionInCaches({
        legacyId: activityLegacyId,
        going: true,
      });
      patchPersistedHomeSummaryGoingFlag(activityLegacyId, true);
      if (isNewProfileActivity) {
        patchProfileSummaryOnSelection({ isNewSelection: true });
      }
      useActivitySubscriptionStore.getState().applySubscribe(activityLegacyId, goal);
      void refreshHomeSummaryFromServer();
      void refreshProfileActivitiesFromServer();
    } catch {
      showAppToast('itinerary.unpublishedBanner.subscribeRegisterFailed', {
        icon: 'none',
      });
      return 'register_failed';
    }
  }

  markActivityWechatOptIn(activityLegacyId);
  toastForOutcome(wechatOutcome);
  return wechatOutcome === 'accepted' ? 'wechat_accepted' : 'in_app_only';
}

/** Clear follow state and cancel watch_lineup goal (unregisters on backend). */
export async function unsubscribeFromActivityUpdates(
  activityLegacyId: number,
): Promise<ActivityUpdateUnsubscribeResult> {
  if (!Number.isFinite(activityLegacyId) || activityLegacyId <= 0) {
    return 'invalid_activity';
  }
  if (!isLoggedIn()) {
    return 'auth_required';
  }

  clearActivityWechatOptIn(activityLegacyId);

  if (isApiEnabled()) {
    try {
      const goals = await fetchUserGoals(activityLegacyId);
      const watchGoal = goals.find(
        (g) => g.kind === 'watch_lineup' && g.status === 'active',
      );
      const goalId = watchGoal?._id ?? (watchGoal as { id?: string } | undefined)?.id;

      if (goalId) {
        await deleteUserGoalAndInvalidate(goalId);
      }

      await unregisterForActivityAndInvalidate(activityLegacyId);
      patchPersistedHomeSummaryGoingFlag(activityLegacyId, false);
      useActivitySubscriptionStore.getState().applyUnsubscribe(activityLegacyId);
      invalidateProfileActivities();
      await refreshProfileActivitiesFromServer();
      await hydrateActivitySubscriptionStore();
      void refreshHomeSummaryFromServer();
    } catch {
      showAppToast('eventCard.unfollowFailed', { icon: 'none' });
      return 'unregister_failed';
    }
  }

  showAppToast('eventCard.unfollowSuccess', { icon: 'none' });
  return 'success';
}
