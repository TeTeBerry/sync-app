import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockClearStorageSync,
  mockReLaunch,
  mockApiPost,
  mockGetAccessToken,
  mockClearAiChatEphemeralState,
  mockClearAllApiCache,
  mockClearClientUserCache,
  mockNotifyAuthSessionChange,
  mockClearUgcPublishComplianceAck,
} = vi.hoisted(() => ({
  mockClearStorageSync: vi.fn(),
  mockReLaunch: vi.fn().mockResolvedValue(undefined),
  mockApiPost: vi.fn().mockResolvedValue({ ok: true }),
  mockGetAccessToken: vi.fn(),
  mockClearAiChatEphemeralState: vi.fn(),
  mockClearAllApiCache: vi.fn(),
  mockClearClientUserCache: vi.fn(),
  mockNotifyAuthSessionChange: vi.fn(),
  mockClearUgcPublishComplianceAck: vi.fn(),
}));

vi.mock('@tarojs/taro', () => ({
  default: {
    clearStorageSync: mockClearStorageSync,
    reLaunch: mockReLaunch,
  },
}));

vi.mock('@/utils/apiClient', () => ({
  apiPost: mockApiPost,
}));

vi.mock('@/constants/api', () => ({
  isApiEnabled: () => true,
}));

vi.mock('@/utils/authStorage', () => ({
  getAccessToken: mockGetAccessToken,
}));

vi.mock('@/utils/aiChatEphemeral', () => ({
  clearAiChatEphemeralState: mockClearAiChatEphemeralState,
}));

vi.mock('@/hooks/useApiQuery', () => ({
  clearAllApiCache: mockClearAllApiCache,
}));

vi.mock('@/utils/session', () => ({
  clearClientUserCache: mockClearClientUserCache,
}));

vi.mock('@/utils/authSession', () => ({
  notifyAuthSessionChange: mockNotifyAuthSessionChange,
}));

vi.mock('@/utils/ugcPublishComplianceStorage', () => ({
  clearUgcPublishComplianceAck: mockClearUgcPublishComplianceAck,
}));

vi.mock('@/utils/route', () => ({
  ROUTES: { HOME: '/pages/index/index' },
}));

import { clearAllLocalUserData } from '@/utils/clearAllLocalUserData';

const HOME_ROUTE = '/pages/index/index';

describe('clearAllLocalUserData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAccessToken.mockReturnValue(null);
  });

  it('clears storage and relaunches home without calling logout when guest', async () => {
    await clearAllLocalUserData();

    expect(mockApiPost).not.toHaveBeenCalled();
    expect(mockClearAiChatEphemeralState).toHaveBeenCalledWith('local reset');
    expect(mockClearAllApiCache).toHaveBeenCalled();
    expect(mockClearClientUserCache).toHaveBeenCalled();
    expect(mockClearStorageSync).toHaveBeenCalled();
    expect(mockClearUgcPublishComplianceAck).toHaveBeenCalled();
    expect(mockNotifyAuthSessionChange).toHaveBeenCalled();
    expect(mockReLaunch).toHaveBeenCalledWith({ url: HOME_ROUTE });
  });

  it('revokes jwt before wiping local state when logged in', async () => {
    mockGetAccessToken.mockReturnValue('token-123');

    await clearAllLocalUserData();

    expect(mockApiPost).toHaveBeenCalledWith(
      '/auth/logout',
      {},
      undefined,
      expect.objectContaining({ maxRetries: 0 }),
    );
    expect(mockClearStorageSync).toHaveBeenCalled();
  });
});
