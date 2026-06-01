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

import { fetchPopularPosts, likePost } from './posts';

function mockSuccessResponse(data: unknown, statusCode = 200) {
  mockRequest.mockImplementation(
    (opts: { success?: (res: { statusCode: number; data: unknown }) => void }) => {
      opts.success?.({ statusCode, data: { code: 200, data } });
    },
  );
}

function lastRequestUrl(): string {
  const call = mockRequest.mock.calls[mockRequest.mock.calls.length - 1];
  return (call[0] as { url: string }).url;
}

describe('api/sync/posts query params', () => {
  beforeEach(() => {
    mockRequest.mockReset();
    mockGetAccessToken.mockReturnValue(null);
    mockGetAuthHeaders.mockReturnValue({});
    mockGetClientUserId.mockReturnValue('demo-client-id');
    mockSuccessResponse([]);
  });

  it('likePost includes userId and not authorName when no token', async () => {
    await likePost('post-1');
    const url = lastRequestUrl();
    expect(url).toContain('userId=');
    expect(url).not.toContain('authorName=');
  });

  it('fetchPopularPosts omits userId and authorName when bearer token present', async () => {
    mockGetAccessToken.mockReturnValue('jwt-token');
    await fetchPopularPosts(10);
    const url = lastRequestUrl();
    expect(url).not.toContain('userId=');
    expect(url).not.toContain('authorName=');
    expect(url).toContain('limit=10');
  });
});
