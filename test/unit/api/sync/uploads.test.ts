import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const cosUrl =
  'https://syncapp-1304288643.cos.ap-shanghai.myqcloud.com/uploads/posts/demo-user/a.jpg';
const signedUrl = `${cosUrl}?q-sign-algorithm=sha1`;

vi.mock('@/utils/apiClient', () => ({
  apiPost: vi.fn(),
}));

describe('resolveSignedUploadUrls batching', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    const { clearSignedUploadUrlCache } = await import('@/api/sync/uploads');
    clearSignedUploadUrlCache();
    const { apiPost } = await import('@/utils/apiClient');
    vi.mocked(apiPost).mockResolvedValue([
      { inputUrl: cosUrl, url: cosUrl, displayUrl: signedUrl },
    ]);
  });

  afterEach(async () => {
    vi.useRealTimers();
    const { clearSignedUploadUrlCache } = await import('@/api/sync/uploads');
    clearSignedUploadUrlCache();
    vi.clearAllMocks();
  });

  it('dedupes concurrent requests into one API call', async () => {
    const { resolveSignedUploadUrls } = await import('@/api/sync/uploads');
    const { apiPost } = await import('@/utils/apiClient');

    const first = resolveSignedUploadUrls([cosUrl]);
    const second = resolveSignedUploadUrls([cosUrl]);

    await vi.runAllTimersAsync();

    const [rowsA, rowsB] = await Promise.all([first, second]);
    expect(apiPost).toHaveBeenCalledTimes(1);
    expect(apiPost).toHaveBeenCalledWith('/uploads/signed-urls', { urls: [cosUrl] });
    expect(rowsA[0]?.displayUrl).toBe(signedUrl);
    expect(rowsB[0]?.displayUrl).toBe(signedUrl);
  });

  it('serves cached URLs without another API call', async () => {
    const { resolveSignedUploadUrls } = await import('@/api/sync/uploads');
    const { apiPost } = await import('@/utils/apiClient');

    const first = resolveSignedUploadUrls([cosUrl]);
    await vi.runAllTimersAsync();
    await first;
    expect(apiPost).toHaveBeenCalledTimes(1);

    const cached = await resolveSignedUploadUrls([cosUrl]);
    expect(apiPost).toHaveBeenCalledTimes(1);
    expect(cached[0]?.displayUrl).toBe(signedUrl);
  });

  it('does not cache COS post rows missing displayUrl', async () => {
    const { resolveSignedUploadUrls } = await import('@/api/sync/uploads');
    const { apiPost } = await import('@/utils/apiClient');

    vi.mocked(apiPost).mockResolvedValueOnce([{ inputUrl: cosUrl, url: cosUrl }]);

    const first = resolveSignedUploadUrls([cosUrl]);
    await vi.runAllTimersAsync();
    const rows = await first;
    expect(rows[0]?.displayUrl).toBeUndefined();

    vi.mocked(apiPost).mockResolvedValueOnce([
      { inputUrl: cosUrl, url: cosUrl, displayUrl: signedUrl },
    ]);

    const second = resolveSignedUploadUrls([cosUrl]);
    await vi.runAllTimersAsync();
    const retried = await second;
    expect(apiPost).toHaveBeenCalledTimes(2);
    expect(retried[0]?.displayUrl).toBe(signedUrl);
  });
});
