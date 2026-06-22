import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.hoisted(() => {
  process.env.TARO_ENV = 'weapp';
});

import Taro from '@tarojs/taro';
import { useNavigationStore } from '@/stores/navigationStore';
import {
  beginTabRouteTransition,
  endRouteTransition,
  isOnTabRoot,
  resolveTabRouteFromPath,
  ROUTES,
  subscribeTabRouteChange,
  switchTabTo,
  syncTabBarRoute,
} from '@/utils/route';

vi.mock('@tarojs/taro', () => ({
  default: {
    getCurrentPages: vi.fn(),
    switchTab: vi.fn(),
    reLaunch: vi.fn(),
    showToast: vi.fn(),
    navigateTo: vi.fn(),
    navigateBack: vi.fn(),
    preloadPage: vi.fn(),
  },
  useDidShow: vi.fn((cb: () => void) => {
    cb();
  }),
}));

vi.mock('@/constants/api', () => ({
  API_BASE_URL: 'https://api.test',
  isLiveApi: () => false,
}));

vi.mock('@/utils/subpackagePreload', () => ({
  preloadEventSubpackage: vi.fn(),
  ensureEventSubpackageLoaded: vi.fn(() => Promise.resolve()),
  preloadProfileSubpackage: vi.fn(),
  preloadAiSubpackage: vi.fn(),
  preloadStackSubpackages: vi.fn(),
}));

vi.mock('@/hooks/useApiQuery', () => ({
  getCacheData: vi.fn(),
}));

describe('tab switch loading', () => {
  beforeEach(() => {
    endRouteTransition();
    vi.mocked(Taro.getCurrentPages).mockReturnValue([
      { route: 'pages/index/index' },
    ] as never);
    vi.mocked(Taro.switchTab).mockImplementation((options) => {
      options?.success?.({ errMsg: 'switchTab:ok' } as never);
      options?.complete?.({ errMsg: 'switchTab:ok' } as never);
      return Promise.resolve({ errMsg: 'switchTab:ok' });
    });
  });

  afterEach(() => {
    endRouteTransition();
    vi.clearAllMocks();
  });

  it('beginTabRouteTransition activates store for a different tab', () => {
    beginTabRouteTransition(ROUTES.EVENTS);
    expect(useNavigationStore.getState().routeTransition).toEqual({
      active: true,
      tabTarget: ROUTES.EVENTS,
    });
  });

  it('beginTabRouteTransition skips when already on target tab', () => {
    beginTabRouteTransition(ROUTES.HOME);
    expect(useNavigationStore.getState().routeTransition.active).toBe(false);
  });

  it('switchTabTo shows loading then switchTab on weapp', async () => {
    switchTabTo(ROUTES.PROFILE);
    expect(useNavigationStore.getState().routeTransition).toMatchObject({
      active: true,
      tabTarget: ROUTES.PROFILE,
    });
    await vi.waitUntil(() => vi.mocked(Taro.switchTab).mock.calls.length > 0);
    expect(Taro.switchTab).toHaveBeenCalledWith(
      expect.objectContaining({ url: ROUTES.PROFILE }),
    );
  });

  it('switchTabTo does not activate loading for the active tab', () => {
    switchTabTo(ROUTES.HOME);
    expect(useNavigationStore.getState().routeTransition.active).toBe(false);
    expect(Taro.switchTab).not.toHaveBeenCalled();
  });

  it('resolveTabRouteFromPath maps tab roots and profile subpackage routes', () => {
    expect(resolveTabRouteFromPath(ROUTES.PROFILE)).toBe(ROUTES.PROFILE);
    expect(resolveTabRouteFromPath(ROUTES.SETTINGS)).toBe(ROUTES.PROFILE);
    expect(resolveTabRouteFromPath(ROUTES.AI_ASSISTANT)).toBe(ROUTES.HOME);
    expect(resolveTabRouteFromPath(ROUTES.EVENT_DETAIL)).toBeNull();
  });

  it('syncTabBarRoute notifies listeners with the destination tab', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeTabRouteChange(listener);
    syncTabBarRoute(ROUTES.PROFILE);
    expect(listener).toHaveBeenCalled();
    unsubscribe();
  });

  it('isOnTabRoot is false on subpackage stack pages', () => {
    vi.mocked(Taro.getCurrentPages).mockReturnValue([
      { route: 'packageEvent/pages/event-detail/index' },
    ] as never);
    expect(isOnTabRoot(ROUTES.HOME)).toBe(false);
    expect(isOnTabRoot(ROUTES.EVENTS)).toBe(false);
  });

  it('clears stuck optimistic tab when user retaps current tab root during switch', () => {
    syncTabBarRoute(ROUTES.EVENTS);
    switchTabTo(ROUTES.HOME);
    expect(useNavigationStore.getState().routeTransition.active).toBe(false);
  });

  it('resyncs tab bar to the visible page when navigation is skipped', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeTabRouteChange(listener);
    syncTabBarRoute(ROUTES.EVENTS);
    listener.mockClear();

    switchTabTo(ROUTES.HOME);

    expect(Taro.switchTab).not.toHaveBeenCalled();
    expect(listener).toHaveBeenCalled();
    unsubscribe();
  });

  it('forces switchTab for programmatic events navigation even when debounced', async () => {
    switchTabTo(ROUTES.EVENTS, { force: true });
    await vi.waitUntil(() => vi.mocked(Taro.switchTab).mock.calls.length > 0);
    expect(Taro.switchTab).toHaveBeenCalledWith(
      expect.objectContaining({ url: ROUTES.EVENTS }),
    );

    vi.mocked(Taro.switchTab).mockClear();
    switchTabTo(ROUTES.EVENTS, { force: true });
    await vi.waitUntil(() => vi.mocked(Taro.switchTab).mock.calls.length > 0);
    expect(Taro.switchTab).toHaveBeenCalled();
  });

  it('queues switchTab when tab highlight is ahead of the visible page', async () => {
    syncTabBarRoute(ROUTES.EVENTS);
    switchTabTo(ROUTES.EVENTS, { force: true });
    await vi.waitUntil(() => vi.mocked(Taro.switchTab).mock.calls.length > 0);
    expect(Taro.switchTab).toHaveBeenCalledWith(
      expect.objectContaining({ url: ROUTES.EVENTS }),
    );
  });
});
