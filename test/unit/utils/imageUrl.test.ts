import { afterEach, describe, expect, it, vi } from 'vitest';

describe('rewriteLocalDevUploadHost', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('rewrites localhost upload URLs to LAN API host', async () => {
    vi.stubEnv('TARO_APP_API_BASE_URL', 'http://192.168.1.7:3000/api');
    const { rewriteLocalDevUploadHost } = await import('@/utils/imageUrl');
    expect(rewriteLocalDevUploadHost('http://127.0.0.1:3000/uploads/a.jpg')).toBe(
      'http://192.168.1.7:3000/uploads/a.jpg',
    );
  });

  it('leaves external URLs unchanged', async () => {
    vi.stubEnv('TARO_APP_API_BASE_URL', 'http://192.168.1.7:3000/api');
    const { rewriteLocalDevUploadHost } = await import('@/utils/imageUrl');
    const url = 'https://picsum.photos/seed/sync/400/300';
    expect(rewriteLocalDevUploadHost(url)).toBe(url);
  });
});

describe('resolveAbsoluteUploadImageUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('resolves relative /uploads paths against API host', async () => {
    vi.stubEnv('TARO_APP_API_BASE_URL', 'http://192.168.1.7:3000/api');
    const { resolveAbsoluteUploadImageUrl } = await import('@/utils/imageUrl');
    expect(resolveAbsoluteUploadImageUrl('/uploads/a.jpg')).toBe(
      'http://192.168.1.7:3000/uploads/a.jpg',
    );
  });

  it('fixes /api/uploads misconfiguration', async () => {
    vi.stubEnv('TARO_APP_API_BASE_URL', 'http://192.168.1.7:3000/api');
    const { resolveAbsoluteUploadImageUrl } = await import('@/utils/imageUrl');
    expect(
      resolveAbsoluteUploadImageUrl('http://192.168.1.7:3000/api/uploads/a.jpg'),
    ).toBe('http://192.168.1.7:3000/uploads/a.jpg');
  });
});

describe('thumbnailImageUrl uploads', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('does not append resize query params to user upload URLs', async () => {
    vi.stubEnv('TARO_APP_API_BASE_URL', 'http://192.168.1.7:3000/api');
    const { thumbnailImageUrl } = await import('@/utils/imageUrl');
    const url = 'http://192.168.1.7:3000/uploads/a.jpg';
    expect(thumbnailImageUrl(url, 200)).toBe(url);
  });
});

describe('needsWeappDownloadBeforeDisplay', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('downloads LAN backend uploads on weapp', async () => {
    vi.stubEnv('TARO_ENV', 'weapp');
    vi.stubEnv('TARO_APP_API_BASE_URL', 'http://192.168.1.7:3000/api');
    const { needsWeappDownloadBeforeDisplay } = await import('@/utils/imageUrl');
    expect(
      needsWeappDownloadBeforeDisplay('http://192.168.1.7:3000/uploads/a.jpg'),
    ).toBe(true);
  });

  it('skips cloud fileIDs', async () => {
    vi.stubEnv('TARO_ENV', 'weapp');
    const { needsWeappDownloadBeforeDisplay } = await import('@/utils/imageUrl');
    expect(needsWeappDownloadBeforeDisplay('cloud://env.x/ugc/posts/u1/a.jpg')).toBe(
      false,
    );
  });
});

describe('sanitizeImageList', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('drops WeChat sandbox temp paths', async () => {
    vi.stubEnv('TARO_APP_API_BASE_URL', 'http://192.168.1.7:3000/api');
    const { sanitizeImageList } = await import('@/utils/imageUrl');
    expect(
      sanitizeImageList([
        'wxfile://tmp_a.jpg',
        'http://tmp/wxfoo.png',
        'http://192.168.1.7:3000/uploads/a.jpg',
      ]),
    ).toEqual(['http://192.168.1.7:3000/uploads/a.jpg']);
  });
});

describe('isWeappDownloadFileSuccess', () => {
  it('accepts statusCode 200 with tempFilePath', async () => {
    const { isWeappDownloadFileSuccess } = await import('@/utils/imageUrl');
    expect(
      isWeappDownloadFileSuccess({
        statusCode: 200,
        tempFilePath: 'wxfile://tmp_abc.jpg',
      }),
    ).toBe(true);
  });

  it('accepts downloadFile:ok when statusCode is missing', async () => {
    const { isWeappDownloadFileSuccess } = await import('@/utils/imageUrl');
    expect(
      isWeappDownloadFileSuccess({
        errMsg: 'downloadFile:ok',
        tempFilePath: 'wxfile://tmp_abc.jpg',
      }),
    ).toBe(true);
  });
});

describe('resolvePostGridImageSrc', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('prefers resolved URL over original', async () => {
    const { resolvePostGridImageSrc } = await import('@/utils/imageUrl');
    const original = 'cloud://env.x/ugc/posts/u1/a.jpg';
    const resolved = 'https://tmp.example/a.jpg';
    expect(resolvePostGridImageSrc(original, resolved)).toBe(resolved);
  });

  it('returns empty string for unresolved cloud fileIDs', async () => {
    const { resolvePostGridImageSrc } = await import('@/utils/imageUrl');
    const cloud = 'cloud://env.x/ugc/posts/u1/a.jpg';
    expect(resolvePostGridImageSrc(cloud, '')).toBe('');
  });

  it('keeps non-cloud URLs when resolution is unavailable', async () => {
    const { resolvePostGridImageSrc } = await import('@/utils/imageUrl');
    const url = 'https://picsum.photos/seed/x/200/200';
    expect(resolvePostGridImageSrc(url, '')).toBe(url);
  });
});

describe('resolveImageWithFallbackDisplaySrc', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('blocks unresolved cloud fileIDs', async () => {
    const { resolveImageWithFallbackDisplaySrc } = await import('@/utils/imageUrl');
    const cloud = 'cloud://env.x/ugc/posts/u1/a.jpg';
    expect(
      resolveImageWithFallbackDisplaySrc(cloud, 'wxfile://tmp_abc.jpg'),
    ).toBeUndefined();
  });

  it('uses downloaded temp path for LAN uploads on weapp', async () => {
    vi.stubEnv('TARO_ENV', 'weapp');
    vi.stubEnv('TARO_APP_API_BASE_URL', 'http://192.168.1.7:3000/api');
    const { resolveImageWithFallbackDisplaySrc } = await import('@/utils/imageUrl');
    const upload = 'http://192.168.1.7:3000/uploads/a.jpg';
    expect(resolveImageWithFallbackDisplaySrc(upload, 'wxfile://tmp_abc.jpg')).toBe(
      'wxfile://tmp_abc.jpg',
    );
    expect(resolveImageWithFallbackDisplaySrc(upload, undefined)).toBeUndefined();
  });

  it('uses HTTPS src directly on h5', async () => {
    vi.stubEnv('TARO_ENV', 'h5');
    const { resolveImageWithFallbackDisplaySrc } = await import('@/utils/imageUrl');
    const url = 'https://cdn.example.com/uploads/posts/u/a.jpg';
    expect(resolveImageWithFallbackDisplaySrc(url, undefined)).toBe(url);
  });
});
