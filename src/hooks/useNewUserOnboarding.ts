import { useCallback, useMemo } from 'react';
import { type NewUserOnboardingStep } from '@/components/onboarding/NewUserOnboardingSheet';
import { markNewUserOnboardingSeen } from '@/utils/onboardingStorage';
import {
  goEventDetail,
  goEventDetailTravelGuideSheet,
  goEventsWithSearch,
} from '@/utils/route';
import { resolveFeaturedEventLegacyId, type FeaturedEvent } from '@/utils/apiMappers';
import { useT } from '@/hooks/useI18n';

export type UseNewUserOnboardingOptions = {
  featuredEvent?: FeaturedEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function useNewUserOnboarding(options: UseNewUserOnboardingOptions) {
  const { featuredEvent, open, onOpenChange } = options;
  const t = useT();

  const dismiss = useCallback(() => {
    markNewUserOnboardingSeen();
    onOpenChange(false);
  }, [onOpenChange]);

  const dismissAnd = useCallback(
    (action: () => void) => {
      markNewUserOnboardingSeen();
      onOpenChange(false);
      action();
    },
    [onOpenChange],
  );

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
          ? t('onboarding.step2ActionBrowse', { eventName })
          : t('onboarding.stepNeedsEvent'),
        secondaryActionLabel: joinLegacyId
          ? t('onboarding.step2ActionPost')
          : undefined,
        disabled: !joinLegacyId,
        onAction: () => {
          if (!joinLegacyId) {
            return;
          }
          dismissAnd(() => goEventDetail(joinLegacyId, { focusPosts: true }));
        },
        onSecondaryAction: joinLegacyId
          ? () => {
              dismissAnd(() =>
                goEventDetail(joinLegacyId, {
                  openBuddyPost: true,
                  focusPosts: true,
                }),
              );
            }
          : undefined,
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
          dismissAnd(() => goEventDetailTravelGuideSheet(joinLegacyId));
        },
      },
    ];
  }, [dismissAnd, featuredEvent, t]);

  return {
    onboardingOpen: open,
    onboardingSteps: steps,
    dismissOnboarding: dismiss,
  };
}
