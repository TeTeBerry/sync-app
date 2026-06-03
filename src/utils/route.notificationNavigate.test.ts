import { beforeEach, describe, expect, it, vi } from 'vitest';
import Taro from '@tarojs/taro';

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

vi.mock('../constants/api', () => ({
  isLiveApi: () => false,
}));

vi.mock('./subpackagePreload', () => ({
  preloadAiSubpackage: vi.fn(),
  preloadProfileSubpackage: vi.fn(),
  preloadEventSubpackage: vi.fn(),
  preloadStackSubpackages: vi.fn(),
}));

vi.mock('../hooks/useApiQuery', () => ({
  getCacheData: vi.fn(),
}));

vi.mock('../stores/navigationStore', () => ({
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
    vi.clearAllMocks();
    vi.mocked(Taro.navigateTo).mockImplementation((options) => {
      options?.success?.({ errMsg: 'navigateTo:ok' } as never);
      options?.complete?.({ errMsg: 'navigateTo:ok' } as never);
      return Promise.resolve({ errMsg: 'navigateTo:ok' });
    });
  });

  it('opens event detail anchored to post for team apply notifications', async () => {
    const { navigateFromNotification } = await import('./route');
    const opened = navigateFromNotification({
      type: 'application',
      activityLegacyId: 4,
      postId: 'post-abc',
    });

    await vi.waitFor(() => {
      expect(Taro.navigateTo).toHaveBeenCalled();
    });

    expect(opened).toBe(true);
    const url = String(vi.mocked(Taro.navigateTo).mock.calls[0]?.[0]?.url ?? '');
    expect(url).toContain('activityLegacyId=4');
    expect(url).toContain('postId=post-abc');
  });
});
