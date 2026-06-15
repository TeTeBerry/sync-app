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

import { fetchReportStatus, submitReport } from '@/api/sync/users';

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

  it('omits userId query when bearer token is present', async () => {
    mockGetAccessToken.mockReturnValue('token');
    mockGetAuthHeaders.mockReturnValue({ Authorization: 'Bearer token' });
    await submitReport({
      targetType: 'post',
      targetId: 'post-abc',
      category: 'ads',
    });
    expect(lastRequest().url).not.toContain('userId=');
  });
});
