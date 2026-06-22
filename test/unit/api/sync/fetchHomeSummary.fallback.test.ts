import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchHomeSummary } from '@/api/sync/activities';

const mockRequest = vi.fn();

vi.mock('@tarojs/taro', () => ({
  default: { request: (...args: unknown[]) => mockRequest(...args) },
}));

vi.mock('@/utils/authStorage', () => ({
  getAccessToken: () => null,
  getAuthHeaders: () => ({}),
}));

vi.mock('@/api/handleApiUnauthorized', () => ({
  handleApiUnauthorized: vi.fn(),
}));

vi.mock('@/constants/api', () => ({
  API_BASE_URL: 'https://api.test',
}));

vi.mock('@/constants/cloud', () => ({
  isWeappCloudRunTransportEnabled: () => false,
}));

function mockJsonResponse(data: unknown, statusCode = 200) {
  mockRequest.mockImplementationOnce(
    (opts: { success?: (res: { statusCode: number; data: unknown }) => void }) => {
      opts.success?.({ statusCode, data: { code: 200, data } });
    },
  );
}

function mockRequestFailure(message = 'request:fail timeout') {
  mockRequest.mockImplementationOnce(
    (opts: { fail?: (err: { errMsg: string }) => void }) => {
      opts.fail?.({ errMsg: message });
    },
  );
}

describe('fetchHomeSummary', () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it('falls back to public activities catalog when /home fails', async () => {
    mockRequestFailure();
    mockRequestFailure();
    mockRequestFailure();
    mockJsonResponse([
      {
        legacyId: 9,
        name: 'Tomorrowland',
        date: '2026-07-01',
        location: 'Boom',
        attendees: 12,
        hot: true,
      },
    ]);

    const summary = await fetchHomeSummary();

    expect(summary.signupEvents).toHaveLength(1);
    expect(summary.signupEvents[0]?.title).toBe('Tomorrowland');
    expect(mockRequest.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});
