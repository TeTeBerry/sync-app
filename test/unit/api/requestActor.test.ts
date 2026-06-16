import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockHasAuthenticatedRequest = vi.fn(() => false);
const mockGetClientUserId = vi.fn(() => 'session-id');
const mockGetClientUserName = vi.fn(() => 'Guest User');
const mockGetClientUserPhone = vi.fn(() => '');

vi.mock('@/api/requestContext', () => ({
  hasAuthenticatedRequest: () => mockHasAuthenticatedRequest(),
  ownerQueryParams: () => ({}),
  mergeOwnerQueryParams: (extra?: Record<string, string>) => ({
    ...extra,
  }),
  notificationQueryParams: () => undefined,
  resolveRequestUserId: () => 'session-id',
}));

vi.mock('@/utils/session', () => ({
  getClientUserId: () => mockGetClientUserId(),
  getClientUserName: () => mockGetClientUserName(),
  getClientUserPhone: () => mockGetClientUserPhone(),
}));

import { buildAiChatWsSendActor, getClientSessionIdentity } from '@/api/requestActor';

describe('requestActor', () => {
  beforeEach(() => {
    mockHasAuthenticatedRequest.mockReturnValue(false);
    mockGetClientUserId.mockReturnValue('session-id');
    mockGetClientUserName.mockReturnValue('Guest User');
    mockGetClientUserPhone.mockReturnValue('');
  });

  it('getClientSessionIdentity returns session fields when not authenticated', () => {
    expect(getClientSessionIdentity()).toEqual({
      isAuthenticated: false,
      userId: 'session-id',
      displayName: 'Guest User',
      userPhone: '',
    });
  });

  it('buildAiChatWsSendActor includes userId and userName when not authenticated', () => {
    expect(buildAiChatWsSendActor()).toEqual({
      userId: 'session-id',
      userName: 'Guest User',
    });
  });

  it('buildAiChatWsSendActor omits userId and userName when authenticated', () => {
    mockHasAuthenticatedRequest.mockReturnValue(true);
    mockGetClientUserPhone.mockReturnValue('13800138000');
    expect(buildAiChatWsSendActor()).toEqual({ userPhone: '13800138000' });
  });
});
