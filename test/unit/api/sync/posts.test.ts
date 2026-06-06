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

import type { EventDetailPost } from '@/types/backend';
import {
  addPostComment,
  createPost,
  fetchPopularPosts,
  fetchPostComments,
  likePost,
} from '@/api/sync/posts';

const sampleEventDetailPost: EventDetailPost = {
  id: 'post-1',
  name: '风暴电音节',
  location: '上海',
  createdAt: '2026-06-01T10:00:00.000Z',
  body: '找同行',
  tags: ['#组队'],
  likes: 1,
  liked: true,
  comments: 0,
  avatar: '',
  status: '招募中',
};

function postMutationMock(post: EventDetailPost): { post: EventDetailPost } {
  return { post };
}

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
    mockSuccessResponse(postMutationMock(sampleEventDetailPost));
    const result = await likePost('post-1');
    const url = lastRequestUrl();
    expect(url).toContain('userId=');
    expect(url).not.toContain('authorName=');
    expect(result).toEqual(sampleEventDetailPost);
    expect(result.liked).toBe(true);
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

describe('api/sync/posts post mutations ({ post })', () => {
  beforeEach(() => {
    mockRequest.mockReset();
    mockGetAccessToken.mockReturnValue(null);
    mockGetAuthHeaders.mockReturnValue({});
    mockGetClientUserId.mockReturnValue('demo-client-id');
  });

  it('addPostComment unwraps { post } mutation response', async () => {
    const postAfterComment: EventDetailPost = {
      ...sampleEventDetailPost,
      comments: 2,
    };
    mockSuccessResponse(postMutationMock(postAfterComment));
    const result = await addPostComment('post-1', 'nice');
    expect(result).toEqual(postAfterComment);
    expect(result.comments).toBe(2);
  });
});

describe('api/sync/posts createPost (组队发帖 REST)', () => {
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
      likes: 0,
      comments: 0,
      avatar: '',
      status: '招募中',
    });
  });

  it('GET /posts/:id/comments passes limit and cursor query', async () => {
    mockSuccessResponse({ items: [], hasMore: false });
    await fetchPostComments('post-9', { limit: 20, cursor: 'abc' });

    const call = mockRequest.mock.calls[0][0] as { url: string };
    expect(call.url).toContain('/posts/post-9/comments');
    expect(call.url).toContain('limit=20');
    expect(call.url).toContain('cursor=abc');
  });

  it('POST /posts with JSON body and auth headers', async () => {
    await createPost({
      body: '找同行\n\n#组队',
      activityLegacyId: 9,
      eventTitle: '风暴电音节',
      location: '上海',
      tags: ['#组队'],
      contentTypes: ['team'],
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
        contentTypes: ['team'],
      }),
    );
  });
});
