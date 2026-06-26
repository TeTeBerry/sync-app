import { useCallback, useMemo, useState } from 'react';
import Taro, { useDidShow, useRouter } from '@tarojs/taro';
import { isLoggedIn } from '@/utils/authStorage';
import { hasLegalConsent } from '@/utils/legalConsentStorage';
import { hasSeenNewUserOnboarding } from '@/utils/onboardingStorage';
import { hasSeenPlurEntry, markPlurEntrySeen } from '@/utils/plurEntryStorage';
import {
  markOnboardingConvertedFromPlurFilm,
  parsePlurFilmReturnIntent,
  resolveFirstRunOverlay,
} from '@/utils/firstRunOrchestrator.util';
import { shouldBypassFirstRunOverlays } from '@/utils/resolveShareLandingIntent';

/**
 * Set to true when US-Q2-62 PlurEntrySheet is wired on the home page.
 */
const PLUR_ENTRY_UI_READY = true;

function mergeLaunchParams(
  routerParams: Record<string, string | undefined>,
): Record<string, string | undefined> {
  try {
    const enterQuery = Taro.getEnterOptionsSync()?.query ?? {};
    return { ...enterQuery, ...routerParams };
  } catch {
    return { ...routerParams };
  }
}

export function useFirstRunOrchestrator() {
  const router = useRouter();
  const [plurEntryOpen, setPlurEntryOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [highlightStepIndex, setHighlightStepIndex] = useState<number | undefined>();

  const launchParams = useMemo(() => mergeLaunchParams(router.params), [router.params]);

  const evaluateOnShow = useCallback(() => {
    const filmReturn = parsePlurFilmReturnIntent(launchParams);
    if (filmReturn.converted) {
      markOnboardingConvertedFromPlurFilm();
    }
    setHighlightStepIndex(filmReturn.highlightStepIndex);

    const shareBypass = shouldBypassFirstRunOverlays(launchParams);

    const result = resolveFirstRunOverlay({
      isLoggedIn: isLoggedIn(),
      hasLegalConsent: hasLegalConsent(),
      plurEntrySeen: hasSeenPlurEntry(),
      onboardingSeen: hasSeenNewUserOnboarding(),
      shareBypass,
      plurEntryUiReady: PLUR_ENTRY_UI_READY,
    });

    if (result.autoMarkPlurEntry) {
      markPlurEntrySeen();
    }

    setPlurEntryOpen(result.overlay === 'plur-entry');
    setOnboardingOpen(result.overlay === 'onboarding');
  }, [launchParams]);

  useDidShow(() => {
    evaluateOnShow();
  });

  const dismissPlurEntry = useCallback(() => {
    markPlurEntrySeen();
    setPlurEntryOpen(false);
    if (!hasSeenNewUserOnboarding()) {
      setOnboardingOpen(true);
    }
  }, []);

  const completePlurEntryWithoutL2 = useCallback(() => {
    markPlurEntrySeen();
    setPlurEntryOpen(false);
  }, []);

  const dismissOnboarding = useCallback(() => {
    setOnboardingOpen(false);
  }, []);

  return {
    plurEntryOpen,
    onboardingOpen,
    highlightStepIndex,
    setOnboardingOpen,
    dismissPlurEntry,
    completePlurEntryWithoutL2,
    dismissOnboarding,
  };
}
