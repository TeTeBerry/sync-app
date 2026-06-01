import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetAccessToken = vi.fn<() => string | null>(() => null);
const mockGetAuthUser = vi.fn<() => { id: string; name: string } | null>(() => null);
const mockShouldSkipAutoLogin = vi.fn(() => false);
const mockApiPost = vi.fn();

vi.mock('./authStorage', () => ({
  getAccessToken: () => mockGetAccessToken(),
  getAuthUser: () => mockGetAuthUser(),
  shouldSkipAutoLogin: () => mockShouldSkipAutoLogin(),
  clearSkipAutoLogin: vi.fn(),
  saveAuthStorage: vi.fn(),
  clearAuthStorage: vi.fn(),
  markSkipAutoLogin: vi.fn(),
  getAuthUserId: vi.fn(() => null),
  getAuthUserName: vi.fn(() => null),
  getAuthHeaders: vi.fn(() => ({})),
  isLoggedIn: vi.fn(() => false),
}));

vi.mock('../constants/api', () => ({
  isApiEnabled: () => true,
}));

vi.mock('./apiClient', () => ({
  apiPost: (...args: unknown[]) => mockApiPost(...args),
}));

vi.mock('./session', () => ({
  clearClientUserCache: vi.fn(),
  persistUserName: vi.fn(),
}));

vi.mock('./authSession', () => ({
  notifyAuthSessionChange: vi.fn(),
}));

describe('ensureAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockGetAccessToken.mockReturnValue(null);
    mockGetAuthUser.mockReturnValue(null);
    mockShouldSkipAutoLogin.mockReturnValue(false);
  });

  it('returns existing session without network when token and user exist', async () => {
    mockGetAccessToken.mockReturnValue('token-abc');
    mockGetAuthUser.mockReturnValue({ id: 'user-1', name: 'Dev User' });

    const { ensureAuth } = await import('./auth');
    const result = await ensureAuth();

    expect(result).toEqual({
      accessToken: 'token-abc',
      user: { id: 'user-1', name: 'Dev User' },
    });
    expect(mockApiPost).not.toHaveBeenCalled();
  });

  it('skips silent login after explicit logout', async () => {
    mockShouldSkipAutoLogin.mockReturnValue(true);

    const { ensureAuth } = await import('./auth');
    const result = await ensureAuth();

    expect(result).toBeNull();
    expect(mockApiPost).not.toHaveBeenCalled();
  });

  it('returns null when API is disabled', async () => {
    vi.doMock('../constants/api', () => ({
      isApiEnabled: () => false,
    }));

    const { ensureAuth } = await import('./auth');
    const result = await ensureAuth();

    expect(result).toBeNull();
    expect(mockApiPost).not.toHaveBeenCalled();
  });
});
