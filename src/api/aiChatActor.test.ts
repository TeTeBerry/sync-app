import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockHasAuthenticatedRequest = vi.fn(() => false);
const mockGetClientUserId = vi.fn(() => 'demo-id');
const mockGetClientUserName = vi.fn(() => 'Demo User');
const mockGetClientUserPhone = vi.fn(() => '');

vi.mock('./requestContext', () => ({
  hasAuthenticatedRequest: () => mockHasAuthenticatedRequest(),
}));

vi.mock('../utils/session', () => ({
  getClientUserId: () => mockGetClientUserId(),
  getClientUserName: () => mockGetClientUserName(),
  getClientUserPhone: () => mockGetClientUserPhone(),
}));

import { buildAiChatWsSendActor } from './aiChatActor';

describe('buildAiChatWsSendActor', () => {
  beforeEach(() => {
    mockHasAuthenticatedRequest.mockReturnValue(false);
    mockGetClientUserId.mockReturnValue('demo-id');
    mockGetClientUserName.mockReturnValue('Demo User');
    mockGetClientUserPhone.mockReturnValue('');
  });

  it('includes userId and userName when not authenticated', () => {
    expect(buildAiChatWsSendActor()).toEqual({
      userId: 'demo-id',
      userName: 'Demo User',
    });
  });

  it('omits userId and userName when authenticated', () => {
    mockHasAuthenticatedRequest.mockReturnValue(true);
    mockGetClientUserPhone.mockReturnValue('13800138000');
    expect(buildAiChatWsSendActor()).toEqual({ userPhone: '13800138000' });
  });
});
