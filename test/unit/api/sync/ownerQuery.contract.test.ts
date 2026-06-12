import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRequest = vi.fn();
const mockGetAccessToken = vi.fn((): string | null => null);
const mockGetAuthHeaders = vi.fn(() => ({}));
const mockGetClientUserId = vi.fn(() => 'demo-client-id');

vi.mock('@tarojs/taro', () => ({
  default: { request: (...args: unknown[]) => mockRequest(...args) },
}));

vi.mock('@/utils/session', () => ({
  getClientUserId: () => mockGetClientUserId(),
}));

vi.mock('@/utils/authStorage', () => ({
  getAccessToken: () => mockGetAccessToken(),
  getAuthHeaders: () => mockGetAuthHeaders(),
}));

vi.mock('@/api/handleApiUnauthorized', () => ({
  handleApiUnauthorized: vi.fn(),
}));

vi.mock('@/constants/api', () => ({
  API_BASE_URL: 'https://api.test',
}));

import { fetchHomeSummary, registerForActivity } from '@/api/sync/activities';
import { fetchNotifications } from '@/api/sync/notifications';
import { fetchProfilePosts, fetchProfileSummary } from '@/api/sync/profile';

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

function expectNoActorQuery(url: string) {
  expect(url).not.toContain('userId=');
  expect(url).not.toContain('authorName=');
}

describe('api/sync owner query contract', () => {
  beforeEach(() => {
    mockRequest.mockReset();
    mockGetAccessToken.mockReturnValue(null);
    mockGetAuthHeaders.mockReturnValue({});
    mockGetClientUserId.mockReturnValue('demo-client-id');
    mockSuccessResponse([]);
  });

  describe('profile', () => {
    it('fetchProfilePosts omits actor query when no token', async () => {
      await fetchProfilePosts();
      expectNoActorQuery(lastRequestUrl());
    });

    it('fetchProfilePosts omits actor query when bearer present', async () => {
      mockGetAccessToken.mockReturnValue('jwt-token');
      await fetchProfilePosts();
      expectNoActorQuery(lastRequestUrl());
    });

    it('fetchProfileSummary omits actor query when no token', async () => {
      await fetchProfileSummary();
      expectNoActorQuery(lastRequestUrl());
    });

    it('fetchProfileSummary omits actor query when bearer present', async () => {
      mockGetAccessToken.mockReturnValue('jwt-token');
      await fetchProfileSummary();
      expectNoActorQuery(lastRequestUrl());
    });
  });

  describe('notifications', () => {
    it('fetchNotifications omits actor query when no token', async () => {
      await fetchNotifications();
      expectNoActorQuery(lastRequestUrl());
    });

    it('fetchNotifications omits actor query when bearer present', async () => {
      mockGetAccessToken.mockReturnValue('jwt-token');
      await fetchNotifications();
      expectNoActorQuery(lastRequestUrl());
    });
  });

  describe('activities', () => {
    it('fetchHomeSummary omits actor query when no token', async () => {
      await fetchHomeSummary();
      expectNoActorQuery(lastRequestUrl());
    });

    it('fetchHomeSummary omits actor query when bearer present', async () => {
      mockGetAccessToken.mockReturnValue('jwt-token');
      await fetchHomeSummary();
      expectNoActorQuery(lastRequestUrl());
    });

    it('registerForActivity omits actor query when no token', async () => {
      await registerForActivity(7);
      const url = lastRequestUrl();
      expect(url).toContain('/activities/7/register');
      expectNoActorQuery(url);
    });

    it('registerForActivity omits actor query when bearer present', async () => {
      mockGetAccessToken.mockReturnValue('jwt-token');
      await registerForActivity(7);
      expectNoActorQuery(lastRequestUrl());
    });
  });
});
