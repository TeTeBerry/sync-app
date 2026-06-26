import { markNewUserOnboardingSeen } from '@/utils/onboardingStorage';
import { markPlurEntrySeen } from '@/utils/plurEntryStorage';

export type LaunchParams = Record<string, string | undefined>;

export type PlurFilmReturnIntent = {
  /** H5「去找队」— skip L1/L2 after conversion (US-Q2-65 query: plurFilmConverted=1). */
  converted: boolean;
  /** H5「继续了解 SYNC」— highlight L2 step (US-Q2-65 query: onboardingHighlightStep=N). */
  highlightStepIndex?: number;
};

export type FirstRunOverlay = 'none' | 'plur-entry' | 'onboarding';

export type ResolveFirstRunOverlayInput = {
  isLoggedIn: boolean;
  hasLegalConsent: boolean;
  plurEntrySeen: boolean;
  onboardingSeen: boolean;
  shareBypass: boolean;
  plurEntryUiReady: boolean;
};

export type ResolveFirstRunOverlayResult = {
  overlay: FirstRunOverlay;
  /** When L1 UI is not ready, auto-mark plur entry so L2 can open. */
  autoMarkPlurEntry?: boolean;
};

export function resolveFirstRunOverlay(
  input: ResolveFirstRunOverlayInput,
): ResolveFirstRunOverlayResult {
  if (input.shareBypass) {
    return { overlay: 'none' };
  }
  if (!input.isLoggedIn || !input.hasLegalConsent) {
    return { overlay: 'none' };
  }
  if (!input.plurEntrySeen) {
    if (input.plurEntryUiReady) {
      return { overlay: 'plur-entry' };
    }
    return { overlay: 'onboarding', autoMarkPlurEntry: true };
  }
  if (!input.onboardingSeen) {
    return { overlay: 'onboarding' };
  }
  return { overlay: 'none' };
}

export function parsePlurFilmReturnIntent(params: LaunchParams): PlurFilmReturnIntent {
  const converted =
    params.plurFilmConverted === '1' || params.plurFilmConverted === 'true';

  const raw = params.onboardingHighlightStep?.trim();
  if (!raw) {
    return { converted };
  }
  const index = Number(raw);
  if (!Number.isFinite(index) || index < 1) {
    return { converted };
  }
  return { converted, highlightStepIndex: index };
}

/** Called when user taps "去找队" on PLUR H5 — skip L2 after conversion. */
export function markOnboardingConvertedFromPlurFilm(): void {
  markPlurEntrySeen();
  markNewUserOnboardingSeen();
}
