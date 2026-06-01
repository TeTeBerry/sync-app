import { beforeEach, describe, expect, it, vi } from 'vitest';

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
  isApiEnabled: () => false,
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

describe('event detail routing', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('buildEventDetailQuery includes id and activityLegacyId', async () => {
    const { buildEventDetailQuery } = await import('./route');
    expect(buildEventDetailQuery(42)).toEqual({
      id: '42',
      activityLegacyId: '42',
    });
    expect(buildEventDetailQuery(7, { postId: 'p1' })).toEqual({
      id: '7',
      activityLegacyId: '7',
      postId: 'p1',
    });
  });

  it('resolveEventDetailIdFromQuery prefers id then activityLegacyId then store', async () => {
    const { resolveEventDetailIdFromQuery } = await import('./route');
    expect(resolveEventDetailIdFromQuery({ id: '12' })).toBe(12);
    expect(resolveEventDetailIdFromQuery({ activityLegacyId: '34' })).toBe(34);
    expect(resolveEventDetailIdFromQuery({}, 56)).toBe(56);
    expect(Number.isNaN(resolveEventDetailIdFromQuery({}))).toBe(true);
  });
});
