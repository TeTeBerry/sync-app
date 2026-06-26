import { beforeEach, describe, expect, it, vi } from 'vitest';

const storage: Record<string, unknown> = {};

vi.mock('@tarojs/taro', () => ({
  default: {
    getStorageSync: (key: string) => storage[key],
    setStorageSync: (key: string, value: unknown) => {
      storage[key] = value;
    },
    removeStorageSync: (key: string) => {
      delete storage[key];
    },
  },
}));

import {
  clearNewUserOnboardingSeen,
  hasSeenNewUserOnboarding,
  markNewUserOnboardingSeen,
} from '@/utils/onboardingStorage';
import {
  clearPlurEntrySeen,
  hasSeenPlurEntry,
  markPlurEntrySeen,
} from '@/utils/plurEntryStorage';
import {
  markOnboardingConvertedFromPlurFilm,
  parsePlurFilmReturnIntent,
  resolveFirstRunOverlay,
} from '@/utils/firstRunOrchestrator.util';

const loggedInReady = {
  isLoggedIn: true,
  hasLegalConsent: true,
  plurEntrySeen: false,
  onboardingSeen: false,
  shareBypass: false,
  plurEntryUiReady: false,
};

describe('resolveFirstRunOverlay', () => {
  it('returns none when share bypass is active', () => {
    expect(resolveFirstRunOverlay({ ...loggedInReady, shareBypass: true })).toEqual({
      overlay: 'none',
    });
  });

  it('returns none when not logged in', () => {
    expect(resolveFirstRunOverlay({ ...loggedInReady, isLoggedIn: false })).toEqual({
      overlay: 'none',
    });
  });

  it('returns none when legal consent is missing', () => {
    expect(
      resolveFirstRunOverlay({ ...loggedInReady, hasLegalConsent: false }),
    ).toEqual({ overlay: 'none' });
  });

  it('returns plur-entry when L1 UI is ready and plur entry not seen', () => {
    expect(
      resolveFirstRunOverlay({ ...loggedInReady, plurEntryUiReady: true }),
    ).toEqual({ overlay: 'plur-entry' });
  });

  it('degrades to onboarding when L1 UI is not ready', () => {
    expect(resolveFirstRunOverlay(loggedInReady)).toEqual({
      overlay: 'onboarding',
      autoMarkPlurEntry: true,
    });
  });

  it('returns onboarding when plur entry seen but onboarding not seen', () => {
    expect(
      resolveFirstRunOverlay({
        ...loggedInReady,
        plurEntrySeen: true,
      }),
    ).toEqual({ overlay: 'onboarding' });
  });

  it('returns none when both plur entry and onboarding are seen', () => {
    expect(
      resolveFirstRunOverlay({
        ...loggedInReady,
        plurEntrySeen: true,
        onboardingSeen: true,
      }),
    ).toEqual({ overlay: 'none' });
  });

  it('returns at most one overlay type', () => {
    const cases = [
      loggedInReady,
      { ...loggedInReady, shareBypass: true },
      { ...loggedInReady, plurEntryUiReady: true },
      { ...loggedInReady, plurEntrySeen: true },
      { ...loggedInReady, plurEntrySeen: true, onboardingSeen: true },
    ];
    for (const input of cases) {
      const { overlay } = resolveFirstRunOverlay(input);
      expect(['none', 'plur-entry', 'onboarding']).toContain(overlay);
    }
  });
});

describe('parsePlurFilmReturnIntent', () => {
  it('returns converted when plurFilmConverted=1', () => {
    expect(parsePlurFilmReturnIntent({ plurFilmConverted: '1' })).toEqual({
      converted: true,
    });
  });

  it('returns converted when plurFilmConverted=true', () => {
    expect(parsePlurFilmReturnIntent({ plurFilmConverted: 'true' })).toEqual({
      converted: true,
    });
  });

  it('parses onboardingHighlightStep', () => {
    expect(parsePlurFilmReturnIntent({ onboardingHighlightStep: '2' })).toEqual({
      converted: false,
      highlightStepIndex: 2,
    });
  });

  it('ignores invalid highlight step', () => {
    expect(parsePlurFilmReturnIntent({ onboardingHighlightStep: '0' })).toEqual({
      converted: false,
    });
    expect(parsePlurFilmReturnIntent({ onboardingHighlightStep: 'abc' })).toEqual({
      converted: false,
    });
  });

  it('parses both converted and highlight', () => {
    expect(
      parsePlurFilmReturnIntent({
        plurFilmConverted: '1',
        onboardingHighlightStep: '2',
      }),
    ).toEqual({ converted: true, highlightStepIndex: 2 });
  });
});

describe('markOnboardingConvertedFromPlurFilm', () => {
  beforeEach(() => {
    clearPlurEntrySeen();
    clearNewUserOnboardingSeen();
  });

  it('marks both plur entry and onboarding as seen', () => {
    expect(hasSeenPlurEntry()).toBe(false);
    expect(hasSeenNewUserOnboarding()).toBe(false);

    markOnboardingConvertedFromPlurFilm();

    expect(hasSeenPlurEntry()).toBe(true);
    expect(hasSeenNewUserOnboarding()).toBe(true);
  });

  it('results in no overlay when resolved after conversion', () => {
    markOnboardingConvertedFromPlurFilm();

    expect(
      resolveFirstRunOverlay({
        ...loggedInReady,
        plurEntrySeen: hasSeenPlurEntry(),
        onboardingSeen: hasSeenNewUserOnboarding(),
      }),
    ).toEqual({ overlay: 'none' });
  });
});
