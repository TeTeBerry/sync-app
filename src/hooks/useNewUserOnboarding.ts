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

export type UseNewUserOnboardingOptions = {
  featuredActivityLegacyId?: number;
};

export function useNewUserOnboarding(options: UseNewUserOnboardingOptions = {}) {
  const { featuredActivityLegacyId } = options;
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
        title: '选一场活动',
        description: joinLegacyId
          ? '在活动 Tab 浏览电音节，或直接进入本场活动详情。选择活动后会自动记录你的参与意向。'
          : '在活动 Tab 浏览电音节资讯，挑选你想参加的活动。',
        actionLabel: joinLegacyId ? '进入本场活动' : '去活动列表',
        onAction: () => {
          if (joinLegacyId) {
            dismissAnd(() => goEventDetail(joinLegacyId));
            return;
          }
          dismissAnd(() => goEventsListTab());
        },
      },
      {
        title: '生成出行攻略',
        description:
          '在 AI 助手绑定活动后，可生成交通、住宿与散场参考（AI 内容仅供参考）。',
        actionLabel: '打开 AI 助手',
        onAction: () => dismissAnd(() => switchTabTo(ROUTES.AI)),
      },
    ];
  }, [dismissAnd, featuredActivityLegacyId]);

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
