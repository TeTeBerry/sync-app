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

import { fetchHomeSummary, registerForActivity } from './activities';
import { fetchNotifications } from './notifications';
import { fetchProfilePosts, fetchProfileSummary } from './profile';

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

function expectDemoActorQuery(url: string) {
  expect(url).toContain('userId=demo-client-id');
  expect(url).not.toContain('authorName=');
}

function expectNoDemoActorQuery(url: string) {
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
    it('fetchProfilePosts includes userId only when no token', async () => {
      await fetchProfilePosts();
      expectDemoActorQuery(lastRequestUrl());
    });

    it('fetchProfilePosts omits demo query when bearer present', async () => {
      mockGetAccessToken.mockReturnValue('jwt-token');
      await fetchProfilePosts();
      expectNoDemoActorQuery(lastRequestUrl());
    });

    it('fetchProfileSummary includes userId and activityLegacyId when scoped and no token', async () => {
      await fetchProfileSummary(42);
      const url = lastRequestUrl();
      expectDemoActorQuery(url);
      expect(url).toContain('activityLegacyId=42');
    });

    it('fetchProfileSummary omits demo query when bearer present', async () => {
      mockGetAccessToken.mockReturnValue('jwt-token');
      await fetchProfileSummary(42);
      const url = lastRequestUrl();
      expectNoDemoActorQuery(url);
      expect(url).toContain('activityLegacyId=42');
    });
  });

  describe('notifications', () => {
    it('fetchNotifications includes userId only when no token', async () => {
      await fetchNotifications();
      expectDemoActorQuery(lastRequestUrl());
    });

    it('fetchNotifications omits userId when bearer present', async () => {
      mockGetAccessToken.mockReturnValue('jwt-token');
      await fetchNotifications();
      expectNoDemoActorQuery(lastRequestUrl());
    });
  });

  describe('activities', () => {
    it('fetchHomeSummary includes userId only when no token', async () => {
      await fetchHomeSummary();
      expectDemoActorQuery(lastRequestUrl());
    });

    it('fetchHomeSummary omits demo query when bearer present', async () => {
      mockGetAccessToken.mockReturnValue('jwt-token');
      await fetchHomeSummary();
      expectNoDemoActorQuery(lastRequestUrl());
    });

    it('registerForActivity includes userId only when no token', async () => {
      await registerForActivity(7);
      const url = lastRequestUrl();
      expect(url).toContain('/activities/7/register');
      expectDemoActorQuery(url);
    });

    it('registerForActivity omits demo query when bearer present', async () => {
      mockGetAccessToken.mockReturnValue('jwt-token');
      await registerForActivity(7);
      expectNoDemoActorQuery(lastRequestUrl());
    });
  });
});
