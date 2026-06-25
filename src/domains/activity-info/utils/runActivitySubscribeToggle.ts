import {
  subscribeToActivityUpdates,
  unsubscribeFromActivityUpdates,
  type ActivityUpdateSubscribeResult,
  type ActivityUpdateUnsubscribeResult,
} from '@/utils/subscribeToActivityUpdates';

export type ActivitySubscribeToggleInput = {
  activityLegacyId: number;
  followed: boolean;
  toggleable: boolean;
  confirmUnfollow?: () => Promise<boolean>;
};

export type ActivitySubscribeToggleResult =
  | { kind: 'noop' }
  | { kind: 'subscribed' }
  | { kind: 'unsubscribed' };

export async function runActivitySubscribeToggle(
  input: ActivitySubscribeToggleInput,
  deps: {
    subscribe?: (id: number) => Promise<ActivityUpdateSubscribeResult>;
    unsubscribe?: (id: number) => Promise<ActivityUpdateUnsubscribeResult>;
  } = {},
): Promise<ActivitySubscribeToggleResult> {
  const subscribe = deps.subscribe ?? subscribeToActivityUpdates;
  const unsubscribe = deps.unsubscribe ?? unsubscribeFromActivityUpdates;

  if (input.followed) {
    if (!input.toggleable) {
      return { kind: 'noop' };
    }
    if (input.confirmUnfollow) {
      const confirmed = await input.confirmUnfollow();
      if (!confirmed) {
        return { kind: 'noop' };
      }
    }
    const result = await unsubscribe(input.activityLegacyId);
    if (result === 'success') {
      return { kind: 'unsubscribed' };
    }
    return { kind: 'noop' };
  }

  const result = await subscribe(input.activityLegacyId);
  if (result === 'wechat_accepted' || result === 'in_app_only') {
    return { kind: 'subscribed' };
  }
  return { kind: 'noop' };
}
