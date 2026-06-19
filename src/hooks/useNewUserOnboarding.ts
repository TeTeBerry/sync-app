import { useCallback, useMemo, useState } from 'react';
import { useDidShow } from '@tarojs/taro';
import {
  NewUserOnboardingSheet,
  type NewUserOnboardingStep,
} from '@/components/onboarding/NewUserOnboardingSheet';
import { isLoggedIn } from '@/utils/authStorage';
import { hasLegalConsent } from '@/utils/legalConsentStorage';
import {
  hasSeenNewUserOnboarding,
  markNewUserOnboardingSeen,
} from '@/utils/onboardingStorage';
import { goEventDetail, goEventsListTab, switchTabTo, ROUTES } from '@/utils/route';
import { useT } from '@/hooks/useI18n';

export type UseNewUserOnboardingOptions = {
  featuredActivityLegacyId?: number;
};

export function useNewUserOnboarding(options: UseNewUserOnboardingOptions = {}) {
  const { featuredActivityLegacyId } = options;
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
    const joinLegacyId =
      featuredActivityLegacyId != null &&
      Number.isFinite(featuredActivityLegacyId) &&
      featuredActivityLegacyId > 0
        ? featuredActivityLegacyId
        : undefined;

    return [
      {
        title: t('onboarding.step1Title'),
        description: joinLegacyId
          ? t('onboarding.step1Desc')
          : t('onboarding.step1DescBrowse'),
        actionLabel: joinLegacyId
          ? t('onboarding.step1ActionFeatured')
          : t('onboarding.step1ActionList'),
        onAction: () => {
          if (joinLegacyId) {
            dismissAnd(() => goEventDetail(joinLegacyId));
            return;
          }
          dismissAnd(() => goEventsListTab());
        },
      },
      {
        title: t('onboarding.step2Title'),
        description: t('onboarding.step2Desc'),
        actionLabel: t('onboarding.step2Action'),
        onAction: () => dismissAnd(() => switchTabTo(ROUTES.AI)),
      },
    ];
  }, [dismissAnd, featuredActivityLegacyId, t]);

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
