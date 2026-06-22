import { useCallback, useEffect, useState } from 'react';
import { requireAuth } from '@/utils/authGate';
import { isActivityUpdateSubscribedLocally } from '@/utils/activityUpdateSubscribeStorage';
import {
  subscribeToActivityUpdates,
  unsubscribeFromActivityUpdates,
} from '@/utils/subscribeToActivityUpdates';

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
          if (followed) {
            if (confirmUnfollow) {
              const confirmed = await confirmUnfollow();
              if (!confirmed) {
                return;
              }
            }

            const result = await unsubscribeFromActivityUpdates(activityLegacyId);
            if (result === 'success') {
              setSubscribed(false);
              setServerFollowing(false);
            }
            return;
          }

          const result = await subscribeToActivityUpdates(activityLegacyId);
          if (result === 'wechat_accepted' || result === 'in_app_only') {
            setSubscribed(true);
            setServerFollowing(true);
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
