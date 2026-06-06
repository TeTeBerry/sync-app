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

describe('isTencentCosPreSignedUrl', () => {
  it('matches any HTTPS COS pre-signed URL', async () => {
    const { isTencentCosPreSignedUrl } = await import('@/utils/imageUrl');
    expect(
      isTencentCosPreSignedUrl(
        'https://cdn.example.com/uploads/posts/u/a.jpg?q-sign-algorithm=sha1',
      ),
    ).toBe(true);
    expect(
      isTencentCosPreSignedUrl(
        'http://192.168.1.7:3000/uploads/a.jpg?q-sign-algorithm=sha1',
      ),
    ).toBe(false);
  });
});

describe('needsWeappDownloadBeforeDisplay', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('downloads signed COS post images on weapp', async () => {
    vi.stubEnv('TARO_ENV', 'weapp');
    vi.stubEnv('TARO_APP_COS_BUCKET', 'syncapp-1304288643');
    vi.stubEnv('TARO_APP_COS_REGION', 'ap-shanghai');
    const { needsWeappDownloadBeforeDisplay } = await import('@/utils/imageUrl');
    const cosUrl =
      'https://syncapp-1304288643.cos.ap-shanghai.myqcloud.com/uploads/posts/wx_user/a.jpg?q-sign-algorithm=sha1';
    expect(needsWeappDownloadBeforeDisplay(cosUrl)).toBe(true);
  });

  it('downloads pre-signed URLs on alternate COS hostnames', async () => {
    vi.stubEnv('TARO_ENV', 'weapp');
    const { needsWeappDownloadBeforeDisplay } = await import('@/utils/imageUrl');
    expect(
      needsWeappDownloadBeforeDisplay(
        'https://other-bucket.cos.ap-guangzhou.myqcloud.com/uploads/posts/u/a.jpg?q-sign-algorithm=sha1',
      ),
    ).toBe(true);
  });

  it('skips download for unsigned COS post images', async () => {
    vi.stubEnv('TARO_ENV', 'weapp');
    vi.stubEnv('TARO_APP_COS_BUCKET', 'syncapp-1304288643');
    vi.stubEnv('TARO_APP_COS_REGION', 'ap-shanghai');
    const { needsWeappDownloadBeforeDisplay } = await import('@/utils/imageUrl');
    const cosUrl =
      'https://syncapp-1304288643.cos.ap-shanghai.myqcloud.com/uploads/posts/wx_user/a.jpg';
    expect(needsWeappDownloadBeforeDisplay(cosUrl)).toBe(false);
  });

  it('downloads LAN backend uploads on weapp', async () => {
    vi.stubEnv('TARO_ENV', 'weapp');
    vi.stubEnv('TARO_APP_API_BASE_URL', 'http://192.168.1.7:3000/api');
    const { needsWeappDownloadBeforeDisplay } = await import('@/utils/imageUrl');
    expect(
      needsWeappDownloadBeforeDisplay('http://192.168.1.7:3000/uploads/a.jpg'),
    ).toBe(true);
  });
});

describe('isCosPostImageUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('matches COS post upload URLs', async () => {
    vi.stubEnv('TARO_APP_COS_BUCKET', 'syncapp-1304288643');
    vi.stubEnv('TARO_APP_COS_REGION', 'ap-shanghai');
    const { isCosPostImageUrl, isCosSignedImageUrl } = await import('@/utils/imageUrl');
    const cosUrl =
      'https://syncapp-1304288643.cos.ap-shanghai.myqcloud.com/uploads/posts/wx_user/a.jpg';
    expect(isCosPostImageUrl(cosUrl)).toBe(true);
    expect(isCosSignedImageUrl(`${cosUrl}?q-sign-algorithm=sha1`)).toBe(true);
    expect(isCosSignedImageUrl(cosUrl)).toBe(false);
  });

  it('does not match non-post upload paths', async () => {
    vi.stubEnv('TARO_APP_COS_BUCKET', 'syncapp-1304288643');
    vi.stubEnv('TARO_APP_COS_REGION', 'ap-shanghai');
    const { isCosPostImageUrl } = await import('@/utils/imageUrl');
    expect(
      isCosPostImageUrl(
        'https://syncapp-1304288643.cos.ap-shanghai.myqcloud.com/uploads/avatars/wx_user/a.jpg',
      ),
    ).toBe(false);
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

  it('prefers signed COS URL over unsigned original', async () => {
    vi.stubEnv('TARO_APP_COS_BUCKET', 'syncapp-1304288643');
    vi.stubEnv('TARO_APP_COS_REGION', 'ap-shanghai');
    const { resolvePostGridImageSrc } = await import('@/utils/imageUrl');
    const unsigned =
      'https://syncapp-1304288643.cos.ap-shanghai.myqcloud.com/uploads/posts/u/a.jpg';
    const signed = `${unsigned}?q-sign-algorithm=sha1`;
    expect(resolvePostGridImageSrc(unsigned, signed)).toBe(signed);
  });

  it('returns empty string for unsigned COS post images without a signed URL', async () => {
    vi.stubEnv('TARO_APP_COS_BUCKET', 'syncapp-1304288643');
    vi.stubEnv('TARO_APP_COS_REGION', 'ap-shanghai');
    const { resolvePostGridImageSrc } = await import('@/utils/imageUrl');
    const unsigned =
      'https://syncapp-1304288643.cos.ap-shanghai.myqcloud.com/uploads/posts/u/a.jpg';
    expect(resolvePostGridImageSrc(unsigned, '')).toBe('');
  });

  it('keeps non-COS URLs when signing is unavailable', async () => {
    const { resolvePostGridImageSrc } = await import('@/utils/imageUrl');
    const url = 'https://picsum.photos/seed/x/200/200';
    expect(resolvePostGridImageSrc(url, '')).toBe(url);
  });
});

describe('resolveImageWithFallbackDisplaySrc', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses downloaded temp path for signed COS URLs on weapp', async () => {
    vi.stubEnv('TARO_ENV', 'weapp');
    vi.stubEnv('TARO_APP_COS_BUCKET', 'syncapp-1304288643');
    vi.stubEnv('TARO_APP_COS_REGION', 'ap-shanghai');
    const { resolveImageWithFallbackDisplaySrc } = await import('@/utils/imageUrl');
    const signed =
      'https://syncapp-1304288643.cos.ap-shanghai.myqcloud.com/uploads/posts/u/a.jpg?q-sign-algorithm=sha1';
    expect(resolveImageWithFallbackDisplaySrc(signed, 'wxfile://tmp_abc.jpg')).toBe(
      'wxfile://tmp_abc.jpg',
    );
    expect(resolveImageWithFallbackDisplaySrc(signed, undefined)).toBeUndefined();
  });

  it('blocks unsigned COS post URLs until signing completes', async () => {
    vi.stubEnv('TARO_ENV', 'weapp');
    vi.stubEnv('TARO_APP_COS_BUCKET', 'syncapp-1304288643');
    vi.stubEnv('TARO_APP_COS_REGION', 'ap-shanghai');
    const { resolveImageWithFallbackDisplaySrc } = await import('@/utils/imageUrl');
    const unsigned =
      'https://syncapp-1304288643.cos.ap-shanghai.myqcloud.com/uploads/posts/u/a.jpg';
    expect(
      resolveImageWithFallbackDisplaySrc(unsigned, 'wxfile://tmp_abc.jpg'),
    ).toBeUndefined();
  });

  it('uses HTTPS src directly on h5', async () => {
    vi.stubEnv('TARO_ENV', 'h5');
    const { resolveImageWithFallbackDisplaySrc } = await import('@/utils/imageUrl');
    const signed =
      'https://cdn.example.com/uploads/posts/u/a.jpg?q-sign-algorithm=sha1';
    expect(resolveImageWithFallbackDisplaySrc(signed, undefined)).toBe(signed);
  });
});
