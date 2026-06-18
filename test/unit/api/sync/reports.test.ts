import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRequest = vi.fn();
const mockGetAccessToken = vi.fn((): string | null => 'token');
const mockGetAuthHeaders = vi.fn(() => ({ Authorization: 'Bearer token' }));
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

import { fetchReportStatus, submitReport } from '@/api/sync/reports';

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

describe('api/sync/reports', () => {
  beforeEach(() => {
    mockRequest.mockReset();
    mockGetAccessToken.mockReturnValue('token');
    mockGetAuthHeaders.mockReturnValue({ Authorization: 'Bearer token' });
    mockSuccessResponse({ reported: false });
  });

  it('fetches report status with query params', async () => {
    await fetchReportStatus('comment', 'cmt-1');
    expect(lastRequestUrl()).toContain('/reports/status');
    expect(lastRequestUrl()).toContain('targetType=comment');
    expect(lastRequestUrl()).toContain('targetId=cmt-1');
  });

  it('submits report payload', async () => {
    mockSuccessResponse({ ok: true, id: 'r1' });
    await submitReport({
      targetType: 'post',
      targetId: 'post-1',
      targetUserId: 'user-1',
      category: 'scalper',
    });
    const call = mockRequest.mock.calls[0][0] as {
      url: string;
      method: string;
      data: Record<string, unknown>;
    };
    expect(call.url).toContain('/reports');
    expect(call.method).toBe('POST');
    expect(call.data).toMatchObject({
      targetType: 'post',
      targetId: 'post-1',
      targetUserId: 'user-1',
      category: 'scalper',
    });
  });
});
