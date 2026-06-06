import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockHasAuthenticatedRequest = vi.fn(() => false);
const mockGetClientUserId = vi.fn(() => 'demo-id');
const mockGetClientUserName = vi.fn(() => 'Demo User');
const mockGetClientUserPhone = vi.fn(() => '');

vi.mock('@/api/requestContext', () => ({
  hasAuthenticatedRequest: () => mockHasAuthenticatedRequest(),
  demoActorQueryParams: () => ({ userId: 'demo-id' }),
  ownerQueryParams: () => (mockHasAuthenticatedRequest() ? {} : { userId: 'demo-id' }),
  mergeOwnerQueryParams: (extra?: Record<string, string>) => ({
    ...(mockHasAuthenticatedRequest() ? {} : { userId: 'demo-id' }),
    ...extra,
  }),
  ownerQueryParamsWithActivity: () => ({}),
  notificationQueryParams: () => undefined,
  resolveRequestUserId: () => 'demo-id',
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
    mockGetClientUserId.mockReturnValue('demo-id');
    mockGetClientUserName.mockReturnValue('Demo User');
    mockGetClientUserPhone.mockReturnValue('');
  });

  it('getClientSessionIdentity returns demo fields when not authenticated', () => {
    expect(getClientSessionIdentity()).toEqual({
      isAuthenticated: false,
      userId: 'demo-id',
      displayName: 'Demo User',
      userPhone: '',
    });
  });

  it('buildAiChatWsSendActor includes userId and userName when not authenticated', () => {
    expect(buildAiChatWsSendActor()).toEqual({
      userId: 'demo-id',
      userName: 'Demo User',
    });
  });

  it('buildAiChatWsSendActor omits userId and userName when authenticated', () => {
    mockHasAuthenticatedRequest.mockReturnValue(true);
    mockGetClientUserPhone.mockReturnValue('13800138000');
    expect(buildAiChatWsSendActor()).toEqual({ userPhone: '13800138000' });
  });
});
