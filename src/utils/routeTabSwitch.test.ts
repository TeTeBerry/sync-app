import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.hoisted(() => {
  process.env.TARO_ENV = 'weapp';
});

import Taro from '@tarojs/taro';
import { useNavigationStore } from '../stores/navigationStore';
import {
  beginTabRouteTransition,
  endRouteTransition,
  ROUTES,
  switchTabTo,
} from './route';

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

vi.mock('../constants/api', () => ({
  isApiEnabled: () => false,
}));

vi.mock('./subpackagePreload', () => ({
  preloadEventSubpackage: vi.fn(),
  preloadProfileSubpackage: vi.fn(),
  preloadAiSubpackage: vi.fn(),
  preloadStackSubpackages: vi.fn(),
}));

vi.mock('../hooks/useApiQuery', () => ({
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
});
