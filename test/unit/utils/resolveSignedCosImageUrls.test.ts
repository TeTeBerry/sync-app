import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearSignedUploadUrlCache } from '@/api/sync/uploads';

const cosUrl =
  'https://syncapp-1304288643.cos.ap-shanghai.myqcloud.com/uploads/posts/demo-user/a.jpg';
const signedUrl = `${cosUrl}?q-sign-algorithm=sha1&q-sign-time=1`;

vi.mock('@/api/sync/uploads', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/sync/uploads')>();
  return {
    ...actual,
    resolveSignedUploadUrls: vi.fn(async (urls: string[]) =>
      urls.map((inputUrl) => ({
        inputUrl,
        url: inputUrl,
        displayUrl: `${inputUrl}?q-sign-algorithm=sha1&q-sign-time=1`,
      })),
    ),
  };
});

describe('resolveSignedCosImageUrls', () => {
  beforeEach(() => {
    clearSignedUploadUrlCache();
    vi.stubEnv('TARO_APP_COS_BUCKET', 'syncapp-1304288643');
    vi.stubEnv('TARO_APP_COS_REGION', 'ap-shanghai');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('returns signed URLs for COS post images', async () => {
    const { resolveSignedCosImageUrls } =
      await import('@/utils/resolveSignedCosImageUrls');
    const result = await resolveSignedCosImageUrls([
      cosUrl,
      'https://picsum.photos/seed/x/200/200',
    ]);
    expect(result).toEqual([signedUrl, 'https://picsum.photos/seed/x/200/200']);
  });

  it('blanks unsigned COS post URLs for display', async () => {
    const { blankCosPostUrlsForDisplay } =
      await import('@/utils/resolveSignedCosImageUrls');
    expect(
      blankCosPostUrlsForDisplay([cosUrl, 'https://picsum.photos/seed/x/200/200']),
    ).toEqual(['', 'https://picsum.photos/seed/x/200/200']);
  });

  it('maps displayUrl by COS object key when hostnames differ', async () => {
    const { resolveSignedUploadUrls } = await import('@/api/sync/uploads');
    const requested = 'https://cdn.example.com/uploads/posts/demo-user/a.jpg';
    vi.mocked(resolveSignedUploadUrls).mockResolvedValueOnce([
      {
        inputUrl: requested,
        url: cosUrl,
        displayUrl: signedUrl,
      },
    ]);

    const { resolveSignedCosImageUrls } =
      await import('@/utils/resolveSignedCosImageUrls');
    const result = await resolveSignedCosImageUrls([requested]);
    expect(result).toEqual([signedUrl]);
  });

  it('maps displayUrl when API row url differs from inputUrl', async () => {
    const { resolveSignedUploadUrls } = await import('@/api/sync/uploads');
    vi.mocked(resolveSignedUploadUrls).mockResolvedValueOnce([
      {
        inputUrl: cosUrl,
        url: `${cosUrl}?legacy=1`,
        displayUrl: signedUrl,
      },
    ]);

    const { buildSignedCosUrlLookup, resolveSignedCosImageUrls } =
      await import('@/utils/resolveSignedCosImageUrls');
    const lookup = buildSignedCosUrlLookup([
      {
        inputUrl: cosUrl,
        url: `${cosUrl}?legacy=1`,
        displayUrl: signedUrl,
      },
    ]);
    expect(lookup.get(cosUrl)).toBe(signedUrl);
    expect(lookup.get(`${cosUrl}?legacy=1`)).toBe(signedUrl);

    const result = await resolveSignedCosImageUrls([cosUrl]);
    expect(result).toEqual([signedUrl]);
  });
});
