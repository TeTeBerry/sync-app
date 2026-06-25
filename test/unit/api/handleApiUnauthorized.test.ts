import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockClearSessionCaches = vi.fn();
const mockClearAuthStorage = vi.fn();
const mockMarkSkipAutoLogin = vi.fn();
const mockClearPersonalityTestResult = vi.fn();
const mockClearClientUserCache = vi.fn();
const mockNotifyAuthSessionChange = vi.fn();
const mockShowAppToast = vi.fn();

vi.mock('@/utils/homeCacheStorage', () => ({
  clearSessionCaches: () => mockClearSessionCaches(),
}));

vi.mock('@/utils/authStorage', () => ({
  clearAuthStorage: () => mockClearAuthStorage(),
  markSkipAutoLogin: () => mockMarkSkipAutoLogin(),
}));

vi.mock('@/domains/personality-test/utils/personalityTestStorage', () => ({
  clearPersonalityTestResult: () => mockClearPersonalityTestResult(),
}));

vi.mock('@/utils/session', () => ({
  clearClientUserCache: () => mockClearClientUserCache(),
}));

vi.mock('@/utils/authSession', () => ({
  notifyAuthSessionChange: () => mockNotifyAuthSessionChange(),
}));

vi.mock('@/utils/appToast', () => ({
  showAppToast: (...args: unknown[]) => mockShowAppToast(...args),
}));

describe('handleApiUnauthorized', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('clears session caches before auth storage on 401', async () => {
    const callOrder: string[] = [];
    mockClearSessionCaches.mockImplementation(() => {
      callOrder.push('sessionCaches');
    });
    mockClearAuthStorage.mockImplementation(() => {
      callOrder.push('authStorage');
    });

    const { handleApiUnauthorized } = await import('@/api/handleApiUnauthorized');
    handleApiUnauthorized('登录已过期');

    expect(mockClearSessionCaches).toHaveBeenCalledTimes(1);
    expect(mockClearAuthStorage).toHaveBeenCalledTimes(1);
    expect(callOrder).toEqual(['sessionCaches', 'authStorage']);
    expect(mockShowAppToast).toHaveBeenCalledWith('登录已过期', {
      raw: true,
      icon: 'none',
    });
  });
});
