import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockCallContainer = vi.fn();
const mockRequest = vi.fn();

vi.mock('@tarojs/taro', () => ({
  default: {
    request: (...args: unknown[]) => mockRequest(...args),
    cloud: {
      callContainer: (...args: unknown[]) => mockCallContainer(...args),
    },
  },
}));

vi.mock('@/utils/authStorage', () => ({
  getAccessToken: () => null,
  getAuthHeaders: () => ({}),
}));

vi.mock('@/api/handleApiUnauthorized', () => ({
  handleApiUnauthorized: vi.fn(),
}));

vi.mock('@/constants/api', () => ({
  API_BASE_URL:
    'https://sync-backend-prd-269371-9-1442514260.sh.run.tcloudbase.com/api',
}));

vi.mock('@/constants/cloud', () => ({
  isWeappCloudRunTransportEnabled: () => true,
  CLOUDBASE_ENV_ID: 'sync-prd-d7gquj4qk86da9bb2',
  CLOUD_RUN_SERVICE: 'sync-backend-prd-269371-9',
  CLOUD_RUN_MAX_TIMEOUT_MS: 15_000,
}));

import { apiGet } from '@/utils/apiClient';

describe('apiClient callContainer', () => {
  beforeEach(() => {
    mockCallContainer.mockReset();
    mockRequest.mockReset();
  });

  it('uses callContainer instead of Taro.request', async () => {
    mockCallContainer.mockResolvedValue({
      statusCode: 200,
      data: { code: 200, message: 'success', data: { ok: true } },
    });

    const data = await apiGet<{ ok: boolean }>('/health');

    expect(data).toEqual({ ok: true });
    expect(mockCallContainer).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/api/health',
        method: 'GET',
        header: expect.objectContaining({
          'X-WX-SERVICE': 'sync-backend-prd-269371-9',
        }),
      }),
    );
    expect(mockRequest).not.toHaveBeenCalled();
  });
});
