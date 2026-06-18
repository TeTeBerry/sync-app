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

import { createPost } from '@/api/sync/posts';

function mockSuccessResponse(data: unknown, statusCode = 200) {
  mockRequest.mockImplementation(
    (opts: { success?: (res: { statusCode: number; data: unknown }) => void }) => {
      opts.success?.({ statusCode, data: { code: 200, data } });
    },
  );
}

describe('api/sync/posts createPost', () => {
  beforeEach(() => {
    mockRequest.mockReset();
    mockGetAccessToken.mockReturnValue('jwt-token');
    mockGetAuthHeaders.mockReturnValue({ Authorization: 'Bearer jwt-token' });
    mockSuccessResponse({
      id: 'post-new',
      name: '风暴电音节',
      location: '上海',
      createdAt: '2026-06-01T10:00:00.000Z',
      body: 'test',
      tags: ['#组队'],
      avatar: '',
    });
  });

  it('POST /posts with JSON body and auth headers', async () => {
    await createPost({
      body: '组队同行\n\n#组队',
      activityLegacyId: 9,
      eventTitle: '风暴电音节',
      location: '上海',
      tags: ['#组队'],
    });

    const call = mockRequest.mock.calls[0][0] as {
      url: string;
      method: string;
      data: unknown;
      header: Record<string, string>;
    };
    expect(call.method).toBe('POST');
    expect(call.url).toContain('/posts');
    expect(call.header.Authorization).toBe('Bearer jwt-token');
    expect(call.data).toEqual(
      expect.objectContaining({
        activityLegacyId: 9,
        location: '上海',
      }),
    );
  });
});
