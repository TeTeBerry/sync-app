import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.hoisted(() => {
  process.env.TARO_ENV = 'weapp';
});

import Taro from '@tarojs/taro';
import { endRouteTransition, goAiAssistant, goNotifications } from '@/utils/route';

const mockIsLoggedIn = vi.fn(() => false);
const mockShow = vi.fn();

vi.mock('@/utils/authStorage', () => ({
  isLoggedIn: () => mockIsLoggedIn(),
}));

vi.mock('@/stores/loginInterceptStore', () => ({
  useLoginInterceptStore: {
    getState: () => ({ show: mockShow }),
  },
}));

vi.mock('@tarojs/taro', () => ({
  default: {
    getCurrentPages: vi.fn(() => [{ route: 'pages/index/index' }]),
    navigateTo: vi.fn((options: { success?: () => void; complete?: () => void }) => {
      options?.success?.();
      options?.complete?.();
      return Promise.resolve({ errMsg: 'navigateTo:ok' });
    }),
    switchTab: vi.fn((options: { success?: () => void; complete?: () => void }) => {
      options?.success?.();
      options?.complete?.();
      return Promise.resolve({ errMsg: 'switchTab:ok' });
    }),
    reLaunch: vi.fn(),
    showToast: vi.fn(),
    navigateBack: vi.fn(),
    preloadPage: vi.fn(() => Promise.resolve()),
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
  preloadAiSubpackage: vi.fn(),
  preloadProfileSubpackage: vi.fn(),
  preloadEventSubpackage: vi.fn(),
  ensureEventSubpackageLoaded: vi.fn(() => Promise.resolve()),
  preloadStackSubpackages: vi.fn(),
}));

vi.mock('@/hooks/useApiQuery', () => ({
  getCacheData: vi.fn(),
}));

vi.mock('@/stores/navigationStore', () => ({
  useNavigationStore: {
    getState: () => ({
      setActiveActivityLegacyId: vi.fn(),
      setAiAssistantIntent: vi.fn(),
      beginRouteTransition: vi.fn(),
      endRouteTransition: vi.fn(),
    }),
  },
}));

describe('route auth gate', () => {
  beforeEach(() => {
    endRouteTransition();
    vi.clearAllMocks();
    mockIsLoggedIn.mockReturnValue(false);
  });

  it('goAiAssistant switches to AI tab and opens login when logged out', async () => {
    goAiAssistant();
    await vi.waitUntil(() => vi.mocked(Taro.switchTab).mock.calls.length > 0);
    expect(Taro.switchTab).toHaveBeenCalled();
    expect(mockShow).toHaveBeenCalledWith('ai_assistant', expect.any(Function));
  });

  it('goAiAssistant switches to AI tab when logged in', () => {
    mockIsLoggedIn.mockReturnValue(true);
    goAiAssistant();
    expect(mockShow).not.toHaveBeenCalled();
  });

  it('goNotifications opens login sheet when logged out', () => {
    goNotifications();
    expect(mockShow).toHaveBeenCalledWith('notification', expect.any(Function));
    expect(Taro.navigateTo).not.toHaveBeenCalled();
  });
});
