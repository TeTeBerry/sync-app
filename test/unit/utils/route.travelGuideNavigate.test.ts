import { beforeEach, describe, expect, it, vi } from 'vitest';

const navigateTo = vi.fn();
const redirectTo = vi.fn();
const getCurrentPages = vi.fn(
  () => [] as { route?: string; options?: Record<string, string> }[],
);

vi.mock('@tarojs/taro', () => ({
  default: {
    getCurrentPages,
    navigateTo,
    redirectTo,
    switchTab: vi.fn(),
    reLaunch: vi.fn(),
    showToast: vi.fn(),
    navigateBack: vi.fn(),
    preloadPage: vi.fn(),
  },
  useDidShow: vi.fn(),
}));

vi.mock('@/constants/api', () => ({
  API_BASE_URL: 'https://api.test',
  isLiveApi: () => false,
}));

vi.mock('@/utils/authGate', () => ({
  isAuthGated: () => false,
  requireAuth: (fn: () => void) => fn(),
}));

vi.mock('@/utils/subpackagePreload', () => ({
  preloadEventSubpackage: vi.fn(),
  preloadProfileSubpackage: vi.fn(),
  ensureEventSubpackageLoaded: vi.fn(() => Promise.resolve()),
}));

vi.mock('@/hooks/useApiQuery', () => ({
  getCacheData: vi.fn(),
}));

vi.mock('@/stores/navigationStore', () => ({
  useNavigationStore: {
    getState: () => ({
      setActiveActivityLegacyId: vi.fn(),
      beginRouteTransition: vi.fn(),
      endRouteTransition: vi.fn(),
      setEventDetailTravelGuideIntent: vi.fn(),
      setEventDetailBuddyPostIntent: vi.fn(),
    }),
  },
}));

describe('travel guide navigation', () => {
  beforeEach(() => {
    vi.resetModules();
    navigateTo.mockReset();
    redirectTo.mockReset();
    getCurrentPages.mockReset();
    getCurrentPages.mockReturnValue([]);
    navigateTo.mockImplementation(
      ({ success, complete }: { success?: () => void; complete?: () => void }) => {
        success?.();
        complete?.();
      },
    );
    redirectTo.mockImplementation(
      ({ success, complete }: { success?: () => void; complete?: () => void }) => {
        success?.();
        complete?.();
      },
    );
    vi.stubEnv('TARO_ENV', 'weapp');
  });

  it('goAiTravelGuide uses navigateTo when stack is shallow', async () => {
    getCurrentPages.mockReturnValue([
      { route: 'packageEvent/pages/event-detail/index' },
    ]);
    const { goAiTravelGuide } = await import('@/utils/route');
    goAiTravelGuide('guide-1');
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(navigateTo).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/packageEvent/pages/ai-travel-guide/index?guideId=guide-1',
      }),
    );
    expect(redirectTo).not.toHaveBeenCalled();
  });

  it('goAiTravelGuide uses redirectTo when page stack is near the limit', async () => {
    getCurrentPages.mockReturnValue(
      Array.from({ length: 8 }, (_, index) => ({
        route: `pages/mock-${index}/index`,
      })),
    );
    const { goAiTravelGuide } = await import('@/utils/route');
    goAiTravelGuide('guide-1');
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(redirectTo).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/packageEvent/pages/ai-travel-guide/index?guideId=guide-1',
      }),
    );
    expect(navigateTo).not.toHaveBeenCalled();
  });

  it('goAiTravelGuide falls back to redirectTo when navigateTo hits webview limit', async () => {
    getCurrentPages.mockReturnValue([
      { route: 'packageEvent/pages/event-detail/index' },
    ]);
    navigateTo.mockImplementation(
      ({
        fail,
        complete,
      }: {
        fail?: (err: { errMsg: string }) => void;
        complete?: () => void;
      }) => {
        fail?.({ errMsg: 'navigateTo:fail webview count limit exceed' });
        complete?.();
      },
    );
    const { goAiTravelGuide } = await import('@/utils/route');
    goAiTravelGuide('guide-1');
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(navigateTo).toHaveBeenCalled();
    expect(redirectTo).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/packageEvent/pages/ai-travel-guide/index?guideId=guide-1',
      }),
    );
  });

  it('goEventDetailTravelGuideSheet replaces ai-travel-guide instead of pushing event-detail', async () => {
    getCurrentPages.mockReturnValue([
      { route: 'pages/index/index' },
      {
        route: 'packageEvent/pages/ai-travel-guide/index',
        options: { guideId: 'guide-1' },
      },
    ]);
    const { goEventDetailTravelGuideSheet } = await import('@/utils/route');
    goEventDetailTravelGuideSheet(42, {
      departure: '上海',
      headcount: 2,
      accommodationNights: 1,
    });
    await Promise.resolve();
    expect(redirectTo).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('/packageEvent/pages/event-detail/index'),
      }),
    );
    expect(navigateTo).not.toHaveBeenCalled();
  });
});
