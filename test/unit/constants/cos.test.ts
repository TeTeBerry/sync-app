import { afterEach, describe, expect, it, vi } from 'vitest';

describe('cos constants', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('reads bucket and region from TARO_APP_COS_*', async () => {
    vi.stubEnv('TARO_APP_COS_BUCKET', 'my-bucket');
    vi.stubEnv('TARO_APP_COS_REGION', 'ap-guangzhou');
    const { COS_BUCKET, COS_REGION, COS_PUBLIC_BASE_URL } =
      await import('@/constants/cos');
    expect(COS_BUCKET).toBe('my-bucket');
    expect(COS_REGION).toBe('ap-guangzhou');
    expect(COS_PUBLIC_BASE_URL).toBe('https://my-bucket.cos.ap-guangzhou.myqcloud.com');
  });
});
