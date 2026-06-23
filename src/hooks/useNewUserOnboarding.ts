import { useCallback, useMemo, useState } from 'react';
import { useDidShow } from '@tarojs/taro';
import { type NewUserOnboardingStep } from '@/components/onboarding/NewUserOnboardingSheet';
import { isLoggedIn } from '@/utils/authStorage';
import { hasLegalConsent } from '@/utils/legalConsentStorage';
import {
  hasSeenNewUserOnboarding,
  markNewUserOnboardingSeen,
} from '@/utils/onboardingStorage';
import {
  goEventDetail,
  goEventDetailBuddyPostSheet,
  goEventDetailTravelGuideSheet,
  goEventsWithSearch,
} from '@/utils/route';
import { resolveFeaturedEventLegacyId, type FeaturedEvent } from '@/utils/apiMappers';
import { useT } from '@/hooks/useI18n';

export type UseNewUserOnboardingOptions = {
  featuredEvent?: FeaturedEvent | null;
};

export function useNewUserOnboarding(options: UseNewUserOnboardingOptions = {}) {
  const { featuredEvent } = options;
  const t = useT();
  const [open, setOpen] = useState(false);

  const dismiss = useCallback(() => {
    markNewUserOnboardingSeen();
    setOpen(false);
  }, []);

  const dismissAnd = useCallback((action: () => void) => {
    markNewUserOnboardingSeen();
    setOpen(false);
    action();
  }, []);

  const steps = useMemo((): NewUserOnboardingStep[] => {
    const joinLegacyId = (() => {
      if (!featuredEvent) {
        return undefined;
      }
      const legacyId = resolveFeaturedEventLegacyId(featuredEvent);
      return legacyId != null && legacyId > 0 ? legacyId : undefined;
    })();
    const eventName = featuredEvent?.title?.trim() || '';

    return [
      {
        title: t('onboarding.step1Title'),
        description: joinLegacyId
          ? t('onboarding.step1Desc')
          : t('onboarding.step1DescBrowse'),
        actionLabel: joinLegacyId
          ? t('onboarding.step1ActionFeatured', { eventName })
          : t('onboarding.step1ActionList'),
        onAction: () => {
          if (joinLegacyId) {
            dismissAnd(() => goEventDetail(joinLegacyId));
            return;
          }
          dismissAnd(() => goEventsWithSearch());
        },
      },
      {
        title: t('onboarding.step2Title'),
        description: joinLegacyId
          ? t('onboarding.step2Desc', { eventName })
          : t('onboarding.step2DescBrowse'),
        actionLabel: joinLegacyId
          ? t('onboarding.step2ActionAnchored', { eventName })
          : t('onboarding.stepNeedsEvent'),
        disabled: !joinLegacyId,
        onAction: () => {
          if (!joinLegacyId) {
            return;
          }
          dismissAnd(() => goEventDetailTravelGuideSheet(joinLegacyId));
        },
      },
      {
        title: t('onboarding.step3Title'),
        description: joinLegacyId
          ? t('onboarding.step3Desc', { eventName })
          : t('onboarding.step3DescBrowse'),
        actionLabel: joinLegacyId
          ? t('onboarding.step3ActionAnchored', { eventName })
          : t('onboarding.stepNeedsEvent'),
        disabled: !joinLegacyId,
        onAction: () => {
          if (!joinLegacyId) {
            return;
          }
          dismissAnd(() => goEventDetailBuddyPostSheet(joinLegacyId));
        },
      },
    ];
  }, [dismissAnd, featuredEvent, t]);

  const evaluateOnShow = useCallback(() => {
    if (!isLoggedIn() || !hasLegalConsent() || hasSeenNewUserOnboarding()) {
      setOpen(false);
      return;
    }
    setOpen(true);
  }, []);

  useDidShow(() => {
    evaluateOnShow();
  });

  return {
    onboardingOpen: open,
    onboardingSteps: steps,
    dismissOnboarding: dismiss,
  };
}
