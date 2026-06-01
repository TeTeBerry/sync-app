import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRequest = vi.fn();
const mockGetAccessToken = vi.fn((): string | null => null);
const mockGetAuthHeaders = vi.fn(() => ({}));
const mockHandleApiUnauthorized = vi.fn();

vi.mock('@tarojs/taro', () => ({
  default: { request: (...args: unknown[]) => mockRequest(...args) },
}));

vi.mock('./authStorage', () => ({
  getAccessToken: () => mockGetAccessToken(),
  getAuthHeaders: () => mockGetAuthHeaders(),
}));

vi.mock('../api/handleApiUnauthorized', () => ({
  handleApiUnauthorized: (...args: unknown[]) => mockHandleApiUnauthorized(...args),
}));

vi.mock('../constants/api', () => ({
  API_BASE_URL: 'https://api.test',
}));

import { apiGet, ApiError } from './apiClient';

function mockHttpResponse(statusCode: number, data: unknown) {
  mockRequest.mockImplementation(
    (opts: { success?: (res: { statusCode: number; data: unknown }) => void }) => {
      opts.success?.({ statusCode, data });
    },
  );
}

describe('apiClient 401', () => {
  beforeEach(() => {
    mockRequest.mockReset();
    mockGetAccessToken.mockReturnValue(null);
    mockGetAuthHeaders.mockReturnValue({});
    mockHandleApiUnauthorized.mockReset();
  });

  it('uses backend envelope message on HTTP 401', async () => {
    mockHttpResponse(401, { code: 401, message: 'Token expired', data: null });

    await expect(apiGet('/profile/summary')).rejects.toMatchObject({
      message: 'Token expired',
      status: 401,
    });
  });

  it('clears session via handleApiUnauthorized when token was present', async () => {
    mockGetAccessToken.mockReturnValue('jwt-token');
    mockHttpResponse(401, { code: 401, message: 'Unauthorized', data: null });

    await expect(apiGet('/profile/summary')).rejects.toBeInstanceOf(ApiError);
    expect(mockHandleApiUnauthorized).toHaveBeenCalledWith('Unauthorized');
  });

  it('does not clear session on 401 when no token (e.g. /auth/dev failure)', async () => {
    mockGetAccessToken.mockReturnValue(null);
    mockHttpResponse(401, { code: 401, message: 'Invalid credentials', data: null });

    await expect(apiGet('/auth/dev')).rejects.toBeInstanceOf(ApiError);
    expect(mockHandleApiUnauthorized).not.toHaveBeenCalled();
  });
});
