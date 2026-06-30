import { useCallback, useState } from 'react';
import { requireAuth } from '@/utils/authGate';
import { useActivitySubscriptionStore } from '@/stores/activitySubscriptionStore';
import { runActivitySubscribeToggle } from '../utils/runActivitySubscribeToggle';

type UseActivityUpdateSubscribeActionOptions = {
  /** When false, already-followed state cannot be toggled off (detail banners). */
  toggleable?: boolean;
  /** When unfollowing, await user confirmation before unregistering. */
  confirmUnfollow?: () => Promise<boolean>;
};

export function useActivityUpdateSubscribeAction(
  activityLegacyId?: number,
  alreadyFollowing = false,
  options?: UseActivityUpdateSubscribeActionOptions,
) {
  const toggleable = options?.toggleable ?? true;
  const confirmUnfollow = options?.confirmUnfollow;
  const [submitting, setSubmitting] = useState(false);
  const hydrated = useActivitySubscriptionStore((state) => state.hydrated);
  const subscribedToUpdates = useActivitySubscriptionStore((state) =>
    activityLegacyId != null && !Number.isNaN(activityLegacyId)
      ? state.hasWatchLineup(activityLegacyId)
      : false,
  );
  const followed = hydrated ? subscribedToUpdates : alreadyFollowing;

  const handleSubscribe = useCallback(() => {
    if (
      submitting ||
      activityLegacyId == null ||
      Number.isNaN(activityLegacyId) ||
      (followed && !toggleable)
    ) {
      return;
    }

    requireAuth(() => {
      void (async () => {
        setSubmitting(true);
        try {
          const result = await runActivitySubscribeToggle({
            activityLegacyId,
            followed,
            toggleable,
            confirmUnfollow,
          });
          if (result.kind === 'noop') {
            return;
          }
        } finally {
          setSubmitting(false);
        }
      })();
    }, 'notification');
  }, [activityLegacyId, confirmUnfollow, followed, submitting, toggleable]);

  return {
    subscribed: followed,
    submitting,
    handleSubscribe,
  };
}
