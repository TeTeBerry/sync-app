import { useCallback, useEffect, useState } from 'react';
import { requireAuth } from '@/utils/authGate';
import { isActivityUpdateSubscribedLocally } from '@/utils/activityUpdateSubscribeStorage';
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
  const [subscribed, setSubscribed] = useState(false);
  const [serverFollowing, setServerFollowing] = useState(alreadyFollowing);
  const [submitting, setSubmitting] = useState(false);
  const followed = serverFollowing || subscribed;

  useEffect(() => {
    setServerFollowing(alreadyFollowing);
  }, [alreadyFollowing]);

  useEffect(() => {
    if (activityLegacyId == null || Number.isNaN(activityLegacyId)) {
      setSubscribed(false);
      return;
    }
    setSubscribed(isActivityUpdateSubscribedLocally(activityLegacyId));
  }, [activityLegacyId]);

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
          if (result.kind === 'subscribed') {
            setSubscribed(true);
            setServerFollowing(true);
          } else if (result.kind === 'unsubscribed') {
            setSubscribed(false);
            setServerFollowing(false);
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
