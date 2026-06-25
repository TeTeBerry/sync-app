import { beforeEach, describe, expect, it, vi } from 'vitest';
import Taro from '@tarojs/taro';

vi.mock('@/utils/authStorage', () => ({
  isLoggedIn: () => true,
}));

vi.mock('@tarojs/taro', () => ({
  default: {
    getCurrentPages: vi.fn(() => []),
    navigateTo: vi.fn(),
    switchTab: vi.fn(),
    reLaunch: vi.fn(),
    showToast: vi.fn(),
    navigateBack: vi.fn(),
    preloadPage: vi.fn(),
  },
  useDidShow: vi.fn(),
}));

vi.mock('@/constants/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/constants/api')>();
  return {
    ...actual,
    isLiveApi: () => false,
  };
});

vi.mock('@/utils/subpackagePreload', () => ({
  preloadProfileSubpackage: vi.fn(),
  preloadEventSubpackage: vi.fn(),
  ensureEventSubpackageLoaded: vi.fn(() => Promise.resolve()),
}));

vi.mock('@/hooks/useApiQuery', () => ({
  getCacheData: vi.fn(() => undefined),
}));

vi.mock('@/stores/navigationStore', () => ({
  useNavigationStore: {
    getState: () => ({
      setActiveActivityLegacyId: vi.fn(),
      beginRouteTransition: vi.fn(),
      endRouteTransition: vi.fn(),
    }),
  },
}));

describe('navigateFromNotification', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.mocked(Taro.getCurrentPages).mockReturnValue([
      { route: 'pages/index/index' },
    ] as never);
    vi.mocked(Taro.navigateTo).mockImplementation((options) => {
      options?.success?.({ errMsg: 'navigateTo:ok' } as never);
      options?.complete?.({ errMsg: 'navigateTo:ok' } as never);
      return Promise.resolve({ errMsg: 'navigateTo:ok' });
    });
  });

  it('opens event detail for activity update notifications', async () => {
    const { navigateFromNotification } = await import('@/utils/route');
    const opened = await navigateFromNotification({
      type: 'activity_update',
      activityLegacyId: 4,
    });

    expect(opened).toBe(true);
    const url = String(vi.mocked(Taro.navigateTo).mock.calls[0]?.[0]?.url ?? '');
    expect(url).toContain('event-detail');
  });

  it('opens profile for post hidden notifications', async () => {
    const { navigateFromNotification } = await import('@/utils/route');

    const opened = await navigateFromNotification({
      type: 'post_hidden',
      postId: 'post-hidden',
    });

    expect(opened).toBe(true);
  });

  it('opens event detail for comment notifications with post highlight', async () => {
    const { navigateFromNotification } = await import('@/utils/route');
    const opened = await navigateFromNotification({
      type: 'comment',
      activityLegacyId: 4,
      postId: 'post-1',
    });

    expect(opened).toBe(true);
    const url = String(vi.mocked(Taro.navigateTo).mock.calls[0]?.[0]?.url ?? '');
    expect(url).toContain('event-detail');
    expect(url).toContain('postId=post-1');
    expect(url).toContain('focusPosts=1');
    expect(url).toContain('openComments=1');
  });
});
