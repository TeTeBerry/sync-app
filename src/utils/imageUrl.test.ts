import { afterEach, describe, expect, it, vi } from 'vitest';

describe('rewriteLocalDevUploadHost', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('rewrites localhost upload URLs to LAN API host', async () => {
    vi.stubEnv('TARO_APP_API_BASE_URL', 'http://192.168.1.7:3000/api');
    const { rewriteLocalDevUploadHost } = await import('./imageUrl');
    expect(rewriteLocalDevUploadHost('http://127.0.0.1:3000/uploads/a.jpg')).toBe(
      'http://192.168.1.7:3000/uploads/a.jpg',
    );
  });

  it('leaves external URLs unchanged', async () => {
    vi.stubEnv('TARO_APP_API_BASE_URL', 'http://192.168.1.7:3000/api');
    const { rewriteLocalDevUploadHost } = await import('./imageUrl');
    const url = 'https://picsum.photos/seed/sync/400/300';
    expect(rewriteLocalDevUploadHost(url)).toBe(url);
  });
});
