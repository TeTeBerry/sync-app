import { useCallback, useEffect, useState } from 'react';
import { requireAuth } from '../../../utils/authGate';
import { isActivityUpdateSubscribedLocally } from '../../../utils/activityUpdateSubscribeStorage';
import { subscribeToActivityUpdates } from '../../../utils/subscribeToActivityUpdates';

export function useActivityUpdateSubscribeAction(activityLegacyId?: number) {
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      subscribed ||
      activityLegacyId == null ||
      Number.isNaN(activityLegacyId)
    ) {
      return;
    }

    requireAuth(() => {
      setSubmitting(true);
      void subscribeToActivityUpdates(activityLegacyId)
        .then((result) => {
          if (result === 'wechat_accepted' || result === 'in_app_only') {
            setSubscribed(true);
          }
        })
        .finally(() => {
          setSubmitting(false);
        });
    }, 'notification');
  }, [activityLegacyId, subscribed, submitting]);

  return {
    subscribed,
    submitting,
    handleSubscribe,
  };
}
