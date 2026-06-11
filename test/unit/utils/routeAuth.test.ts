import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockIsLoggedIn = vi.fn(() => false);
const mockShow = vi.fn();
const mockNavigateTo = vi.fn(
  (options: { success?: () => void; complete?: () => void }) => {
    options?.success?.();
    options?.complete?.();
    return Promise.resolve({ errMsg: 'navigateTo:ok' });
  },
);

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
    navigateTo: mockNavigateTo,
    switchTab: vi.fn(),
    reLaunch: vi.fn(),
    showToast: vi.fn(),
    navigateBack: vi.fn(),
    preloadPage: vi.fn(),
  },
  useDidShow: vi.fn((cb: () => void) => {
    cb();
  }),
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
    vi.clearAllMocks();
    vi.resetModules();
    mockIsLoggedIn.mockReturnValue(false);
  });

  it('goAiAssistant opens login sheet when logged out', async () => {
    const { goAiAssistant } = await import('@/utils/route');
    goAiAssistant();
    expect(mockShow).toHaveBeenCalledWith('ai_assistant', expect.any(Function));
    expect(mockNavigateTo).not.toHaveBeenCalled();
  });

  it('goNotifications opens login sheet when logged out', async () => {
    const { goNotifications } = await import('@/utils/route');
    goNotifications();
    expect(mockShow).toHaveBeenCalledWith('notification', expect.any(Function));
    expect(mockNavigateTo).not.toHaveBeenCalled();
  });
});
