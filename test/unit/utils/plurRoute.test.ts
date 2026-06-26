import { afterEach, describe, expect, it, vi } from 'vitest';

const goMock = vi.fn();
const goEventDetailMock = vi.fn();
const goLegalDocumentMock = vi.fn();
const markPlurEntrySeenMock = vi.fn();
const markOnboardingConvertedMock = vi.fn();

vi.mock('@/utils/route', () => ({
  ROUTES: {
    HOME: '/pages/index/index',
    PLUR_FILM_WEBVIEW: '/packageProfile/pages/plur-film-webview/index',
  },
  buildPageUrl: (path: string, query?: Record<string, string>) => {
    if (!query || Object.keys(query).length === 0) {
      return path;
    }
    const qs = new URLSearchParams(query).toString();
    return `${path}?${qs}`;
  },
  go: (...args: unknown[]) => goMock(...args),
  goEventDetail: (...args: unknown[]) => goEventDetailMock(...args),
}));

vi.mock('@/utils/legalRoute', () => ({
  goLegalDocument: (...args: unknown[]) => goLegalDocumentMock(...args),
}));

vi.mock('@/utils/plurEntryStorage', () => ({
  markPlurEntrySeen: () => markPlurEntrySeenMock(),
}));

vi.mock('@/utils/firstRunOrchestrator.util', () => ({
  markOnboardingConvertedFromPlurFilm: () => markOnboardingConvertedMock(),
}));

import {
  buildPlurFilmH5Src,
  buildPlurFilmWebviewPageQuery,
  handlePlurFilmBridgeAction,
  parsePlurFilmBridgeMessages,
} from '@/utils/plurFilmWebview.util';
import {
  goPlurCulture,
  goPlurFilmFromEntry,
  isPlurFilmH5Available,
} from '@/utils/plurRoute';

describe('plurFilmWebview.util', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    goMock.mockClear();
    goEventDetailMock.mockClear();
    goLegalDocumentMock.mockClear();
    markPlurEntrySeenMock.mockClear();
    markOnboardingConvertedMock.mockClear();
    vi.useRealTimers();
  });

  it('builds web-view page query with context', () => {
    vi.stubEnv('TARO_APP_PLUR_FILM_H5_URL', 'https://cdn.example.com/plur-film/');
    expect(
      buildPlurFilmWebviewPageQuery({
        activityLegacyId: 42,
        from: 'first_visit',
      }),
    ).toEqual({
      activityLegacyId: '42',
      from: 'first_visit',
    });
  });

  it('builds H5 src from env base URL', () => {
    vi.stubEnv('TARO_APP_PLUR_FILM_H5_URL', 'http://127.0.0.1:3000/plur-film/');
    expect(
      buildPlurFilmH5Src({
        from: 'about',
      }),
    ).toBe('http://127.0.0.1:3000/plur-film/index.html?from=about');
  });

  it('builds H5 src with query params', () => {
    vi.stubEnv('TARO_APP_PLUR_FILM_H5_URL', 'https://cdn.example.com/plur-film/');
    expect(
      buildPlurFilmH5Src({
        activityLegacyId: '42',
        from: 'about',
        locale: 'zh-CN',
      }),
    ).toBe(
      'https://cdn.example.com/plur-film/index.html?activityLegacyId=42&from=about&locale=zh-CN',
    );
  });

  it('parses the latest postMessage payload', () => {
    expect(
      parsePlurFilmBridgeMessages([
        { action: 'skip' },
        { action: 'find_team', activityLegacyId: '9', plurFilmConverted: '1' },
      ]),
    ).toEqual({
      action: 'find_team',
      activityLegacyId: '9',
      plurFilmConverted: '1',
    });
  });

  it('handles find_team by marking seen and opening recruit wall', () => {
    vi.useFakeTimers();
    handlePlurFilmBridgeAction({
      action: 'find_team',
      activityLegacyId: '42',
      plurFilmConverted: '1',
    });
    expect(markPlurEntrySeenMock).toHaveBeenCalled();
    expect(markOnboardingConvertedMock).toHaveBeenCalled();
    vi.runAllTimers();
    expect(goEventDetailMock).toHaveBeenCalledWith(42, { focusPosts: true });
  });

  it('handles continue_sync by returning home with onboarding highlight', () => {
    vi.useFakeTimers();
    handlePlurFilmBridgeAction({
      action: 'continue_sync',
      onboardingHighlightStep: '2',
    });
    expect(markPlurEntrySeenMock).toHaveBeenCalled();
    vi.runAllTimers();
    expect(goMock).toHaveBeenCalledWith('/pages/index/index?onboardingHighlightStep=2');
  });
});

describe('plurRoute', () => {
  afterEach(() => {
    goMock.mockClear();
    goLegalDocumentMock.mockClear();
    vi.unstubAllEnvs();
  });

  describe('goPlurFilmFromEntry', () => {
    it('falls back to culture page when H5 URL is unavailable', () => {
      goPlurFilmFromEntry();
      expect(goLegalDocumentMock).toHaveBeenCalledWith('plur-culture');
    });

    it('opens plur-film web-view when HTTPS H5 URL is available', () => {
      vi.stubEnv('TARO_APP_PLUR_FILM_H5_URL', 'https://cdn.example.com/plur-film/');
      expect(isPlurFilmH5Available()).toBe(true);
      goPlurFilmFromEntry({ from: 'about', activityLegacyId: 7 });
      expect(goMock).toHaveBeenCalledWith(
        '/packageProfile/pages/plur-film-webview/index?activityLegacyId=7&from=about',
      );
    });

    it('falls back when H5 URL is http (web-view requires https)', () => {
      vi.stubEnv('TARO_APP_PLUR_FILM_H5_URL', 'http://127.0.0.1:3000/plur-film/');
      expect(isPlurFilmH5Available()).toBe(false);
      goPlurFilmFromEntry();
      expect(goLegalDocumentMock).toHaveBeenCalledWith('plur-culture');
    });
  });

  describe('goPlurCulture', () => {
    it('navigates to plur-culture legal document', () => {
      goPlurCulture();
      expect(goLegalDocumentMock).toHaveBeenCalledWith('plur-culture');
    });
  });
});
