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

describe('resolveImageWithFallbackDisplaySrc', () => {
  it('blocks unresolved cloud fileIDs', async () => {
    const { resolveImageWithFallbackDisplaySrc } = await import('@/utils/imageUrl');
    const cloud = 'cloud://env.x/ugc/posts/u1/a.jpg';
    expect(resolveImageWithFallbackDisplaySrc(cloud)).toBeUndefined();
  });

  it('blocks unresolved personality avatar keys', async () => {
    const { resolveImageWithFallbackDisplaySrc } = await import('@/utils/imageUrl');
    expect(
      resolveImageWithFallbackDisplaySrc('avatar/bunny-teal-headphones.png'),
    ).toBeUndefined();
  });

  it('returns HTTPS src for resolved URLs', async () => {
    const { resolveImageWithFallbackDisplaySrc } = await import('@/utils/imageUrl');
    const url = 'https://cdn.example.com/posts/u/a.jpg';
    expect(resolveImageWithFallbackDisplaySrc(url)).toBe(url);
  });
});

describe('resolveAvatarDisplaySrc', () => {
  it('prefers resolved HTTPS URL', async () => {
    const { resolveAvatarDisplaySrc } = await import('@/utils/imageUrl');
    expect(
      resolveAvatarDisplaySrc(
        'https://cdn.example.com/avatar.png',
        'avatar/bunny-teal-headphones.png',
      ),
    ).toBe('https://cdn.example.com/avatar.png');
  });

  it('never exposes unresolved avatar keys', async () => {
    const { resolveAvatarDisplaySrc } = await import('@/utils/imageUrl');
    expect(
      resolveAvatarDisplaySrc('', 'avatar/bunny-teal-headphones.png', 'fallback'),
    ).toBe('fallback');
  });
});
