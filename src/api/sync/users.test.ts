import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRequest = vi.fn();
const mockGetAccessToken = vi.fn((): string | null => null);
const mockGetAuthHeaders = vi.fn(() => ({}));
const mockGetClientUserId = vi.fn(() => 'demo-client-id');

vi.mock('@tarojs/taro', () => ({
  default: { request: (...args: unknown[]) => mockRequest(...args) },
}));

vi.mock('../../utils/session', () => ({
  getClientUserId: () => mockGetClientUserId(),
}));

vi.mock('../../utils/authStorage', () => ({
  getAccessToken: () => mockGetAccessToken(),
  getAuthHeaders: () => mockGetAuthHeaders(),
}));

vi.mock('../../api/handleApiUnauthorized', () => ({
  handleApiUnauthorized: vi.fn(),
}));

vi.mock('../../constants/api', () => ({
  API_BASE_URL: 'https://api.test',
}));

import {
  blockUser,
  fetchBlockedUserIds,
  fetchReportStatus,
  submitReport,
  unblockUser,
} from './users';

function mockSuccessResponse(data: unknown, statusCode = 200) {
  mockRequest.mockImplementation(
    (opts: { success?: (res: { statusCode: number; data: unknown }) => void }) => {
      opts.success?.({ statusCode, data: { code: 200, data } });
    },
  );
}

function lastRequest(): { url: string; method: string; data?: unknown } {
  const call = mockRequest.mock.calls[mockRequest.mock.calls.length - 1];
  const opts = call[0] as {
    url: string;
    method: string;
    data?: unknown;
  };
  return opts;
}

function lastRequestBody(): Record<string, unknown> {
  const { data } = lastRequest();
  if (data && typeof data === 'object') {
    return data as Record<string, unknown>;
  }
  if (typeof data === 'string') {
    return JSON.parse(data) as Record<string, unknown>;
  }
  return {};
}

describe('api/sync/users moderation', () => {
  beforeEach(() => {
    mockRequest.mockReset();
    mockGetAccessToken.mockReturnValue(null);
    mockGetAuthHeaders.mockReturnValue({});
    mockGetClientUserId.mockReturnValue('demo-client-id');
    mockSuccessResponse({ ok: true });
  });

  it('submitReport POSTs /reports with owner query and payload', async () => {
    mockSuccessResponse({ ok: true, id: 'report-1' });
    await submitReport({
      targetType: 'post',
      targetId: 'post-abc',
      targetUserId: 'user-x',
      category: 'ads',
    });
    const { url, method } = lastRequest();
    expect(method).toBe('POST');
    expect(url).toContain('/reports');
    expect(url).toContain('userId=');
    expect(lastRequestBody()).toEqual({
      targetType: 'post',
      targetId: 'post-abc',
      targetUserId: 'user-x',
      category: 'ads',
    });
  });

  it('fetchReportStatus GETs /reports/status with target query', async () => {
    mockSuccessResponse({ reported: true, category: 'ads' });
    const result = await fetchReportStatus('post', 'post-abc');
    const { url, method } = lastRequest();
    expect(method).toBe('GET');
    expect(url).toContain('/reports/status');
    expect(url).toContain('targetType=post');
    expect(url).toContain('targetId=post-abc');
    expect(result.reported).toBe(true);
  });

  it('blockUser POSTs /users/blocks with blockedUserId', async () => {
    await blockUser('user-blocked');
    const { url, method } = lastRequest();
    expect(method).toBe('POST');
    expect(url).toContain('/users/blocks');
    expect(lastRequestBody()).toEqual({ blockedUserId: 'user-blocked' });
  });

  it('fetchBlockedUserIds GETs /users/blocks', async () => {
    mockSuccessResponse({
      blockedUserIds: ['a', 'b'],
      items: [
        { userId: 'a', name: '用户 A' },
        { userId: 'b', name: '用户 B' },
      ],
    });
    const result = await fetchBlockedUserIds();
    expect(result.blockedUserIds).toEqual(['a', 'b']);
    expect(result.items).toHaveLength(2);
    expect(lastRequest().method).toBe('GET');
    expect(lastRequest().url).toContain('/users/blocks');
  });

  it('unblockUser DELETEs /users/blocks/:id', async () => {
    await unblockUser('user-blocked');
    const { url, method } = lastRequest();
    expect(method).toBe('DELETE');
    expect(url).toContain('/users/blocks/user-blocked');
  });

  it('omits userId query when bearer token is present', async () => {
    mockGetAccessToken.mockReturnValue('token');
    mockGetAuthHeaders.mockReturnValue({ Authorization: 'Bearer token' });
    await blockUser('user-x');
    expect(lastRequest().url).not.toContain('userId=');
  });
});
