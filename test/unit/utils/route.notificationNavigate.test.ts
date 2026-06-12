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

vi.mock('@/constants/api', () => ({
  isLiveApi: () => false,
}));

vi.mock('@/utils/subpackagePreload', () => ({
  preloadAiSubpackage: vi.fn(),
  preloadProfileSubpackage: vi.fn(),
  preloadEventSubpackage: vi.fn(),
  preloadStackSubpackages: vi.fn(),
}));

vi.mock('@/hooks/useApiQuery', () => ({
  getCacheData: vi.fn(() => undefined),
}));

vi.mock('@/utils/notificationNavigation', () => ({
  isPostInteractionNotification: (meta?: { type?: string; category?: string }) =>
    meta?.type === 'like' ||
    meta?.type === 'comment' ||
    meta?.category === 'like' ||
    meta?.category === 'comment',
  resolveNotificationPostTarget: vi.fn(
    async (meta: { postId?: string; activityLegacyId?: number }) => {
      if (!meta.postId?.trim()) return null;
      if (meta.activityLegacyId != null) {
        return { postId: meta.postId, activityLegacyId: meta.activityLegacyId };
      }
      return null;
    },
  ),
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

  it('opens event detail for like notifications with postId', async () => {
    const { navigateFromNotification } = await import('@/utils/route');
    const opened = await navigateFromNotification({
      type: 'like',
      activityLegacyId: 4,
      postId: 'post-abc',
    });

    await vi.waitFor(() => {
      expect(Taro.navigateTo).toHaveBeenCalled();
    });

    expect(opened).toBe(true);
    const url = String(vi.mocked(Taro.navigateTo).mock.calls[0]?.[0]?.url ?? '');
    expect(url).toContain('event-detail');
    expect(url).toContain('postId=post-abc');
  });

  it('opens event detail for comment notifications with postId', async () => {
    const { navigateFromNotification } = await import('@/utils/route');
    const opened = await navigateFromNotification({
      type: 'comment',
      activityLegacyId: 7,
      postId: 'post-comment',
    });

    expect(opened).toBe(true);
    const url = String(vi.mocked(Taro.navigateTo).mock.calls[0]?.[0]?.url ?? '');
    expect(url).toContain('event-detail');
    expect(url).toContain('postId=post-comment');
  });
});
