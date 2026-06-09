import { API_BASE_URL } from '../constants/api';
import { COS_PUBLIC_BASE_URL } from '../constants/cos';

/** Unsplash IDs that 404 or fail in WeChat mini-program. */
const BROKEN_UNSPLASH_PHOTO_IDS = new Set([
  '1459749411177-0479bf78d6f2',
  '1459749411177',
]);

const UNSPLASH_PHOTO_RE = /photo-([a-zA-Z0-9-]+)/;

export function picsumUrl(seed: string, width: number, height?: number): string {
  const h = height ?? Math.round(width * 0.75);
  const safeSeed = seed.replace(/[^a-zA-Z0-9-_]/g, '').slice(0, 48) || 'sync';
  return `https://picsum.photos/seed/${safeSeed}/${width}/${h}`;
}

function extractUnsplashPhotoId(url: URL): string | null {
  const match = url.pathname.match(UNSPLASH_PHOTO_RE);
  return match?.[1] ?? null;
}

function unsplashDimensions(url: URL): { width: number; height: number } {
  const w = Number(url.searchParams.get('w')) || 800;
  const isSquareCrop =
    url.searchParams.get('fit') === 'crop' && url.searchParams.get('crop') === 'face';
  return { width: w, height: isSquareCrop ? w : Math.round(w * 0.75) };
}

function isCosPostUploadImagePathname(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  return normalized.startsWith('/uploads/');
}

export function isUserUploadImageUrl(src: string | undefined): boolean {
  const trimmed = src?.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/')) return true;
  if (!/^https?:\/\//i.test(trimmed)) return false;
  try {
    const url = new URL(trimmed);
    if (isCosPostUploadImagePathname(url.pathname)) {
      try {
        const cosHost = new URL(COS_PUBLIC_BASE_URL).hostname;
        if (url.hostname === cosHost) return true;
      } catch {
        // ignore
      }
    }
    return url.pathname.includes('/uploads/');
  } catch {
    return false;
  }
}

/** Stable COS object key for post images (`uploads/posts/{userId}/...`). */
export function extractCosPostObjectKey(src: string | undefined): string | undefined {
  const resolved = sanitizeRemoteImageUrl(src);
  if (!resolved?.trim()) return undefined;
  const trimmed = resolved.trim();
  try {
    const pathname = new URL(trimmed).pathname;
    const match = pathname.match(/\/uploads\/posts\/[^/]+\/[^/]+/);
    if (!match) return undefined;
    return decodeURIComponent(match[0].replace(/^\/+/, ''));
  } catch {
    const match = trimmed.match(/uploads\/posts\/[^/?#]+/);
    return match?.[0];
  }
}

/** COS post images (`uploads/posts/{userId}/...`) need signed URLs when bucket is private. */
export function isCosPostImageUrl(src: string | undefined): boolean {
  return Boolean(extractCosPostObjectKey(src));
}

/** Tencent COS pre-signed query (works even when hostname differs from TARO_APP_COS_PUBLIC_BASE_URL). */
export function isTencentCosPreSignedUrl(src: string | undefined): boolean {
  const resolved = sanitizeRemoteImageUrl(src);
  if (!resolved?.trim()) return false;
  const trimmed = resolved.trim();
  if (!/^https:\/\//i.test(trimmed)) return false;
  return trimmed.includes('q-sign-algorithm=');
}

/** WeChat Image is unreliable with long COS pre-signed URLs; download to temp path first. */
export function isCosSignedImageUrl(src: string | undefined): boolean {
  return isTencentCosPreSignedUrl(src) && isCosPostImageUrl(src);
}

/** True when Taro `downloadFile` completed successfully enough to use `tempFilePath`. */
export function isWeappDownloadFileSuccess(res: {
  statusCode?: number;
  tempFilePath?: string;
  errMsg?: string;
}): boolean {
  const tempPath = res.tempFilePath?.trim();
  if (!tempPath) return false;
  if (res.statusCode === 200) return true;
  return res.errMsg === 'downloadFile:ok';
}

/** ImageWithFallback display `src`: block unsigned COS posts; on weapp use downloaded temp path. */
export function resolveImageWithFallbackDisplaySrc(
  resolvedSrc: string | undefined,
  downloadedSrc: string | undefined,
): string | undefined {
  const trimmed = resolvedSrc?.trim();
  if (!trimmed) return undefined;
  if (isCosPostImageUrl(trimmed) && !isCosSignedImageUrl(trimmed)) {
    return undefined;
  }
  if (needsWeappDownloadBeforeDisplay(trimmed)) {
    return downloadedSrc?.trim() || undefined;
  }
  return trimmed;
}

/** Post grid tile src: prefer signed COS URL; never pass unsigned private post URLs. */
export function resolvePostGridImageSrc(
  originalSrc: string,
  signedSrc: string | undefined,
): string {
  const signed = signedSrc?.trim();
  if (signed) return signed;
  const trimmed = originalSrc?.trim();
  if (!trimmed) return '';
  if (isCosPostImageUrl(trimmed)) return '';
  return trimmed;
}

/** WeChat `downloadFile` for LAN uploads and COS signed URLs (Image src alone often fails). */
export function needsWeappDownloadBeforeDisplay(src: string | undefined): boolean {
  const resolved = sanitizeRemoteImageUrl(src);
  if (!resolved?.trim()) return false;
  if (process.env.TARO_ENV !== 'weapp') return false;
  if (isTencentCosPreSignedUrl(resolved)) return true;
  if (isCosPostImageUrl(resolved)) return false;
  try {
    const url = new URL(resolved.trim());
    const host = url.hostname.toLowerCase();
    if (host.endsWith('.myqcloud.com') && host.includes('.cos.')) {
      return false;
    }
  } catch {
    return false;
  }
  return isUserUploadImageUrl(resolved);
}

/** Resolve `/uploads/...` and fix `/api/uploads/...` misconfiguration from UPLOAD_PUBLIC_BASE_URL. */
export function resolveAbsoluteUploadImageUrl(src: string): string {
  const trimmed = src.trim();
  if (!trimmed) return trimmed;

  if (/^https?:\/\//i.test(trimmed)) {
    const fixed = trimmed.replace(/^(https?:\/\/[^/]+)\/api\/uploads\//, '$1/uploads/');
    return rewriteLocalDevUploadHost(fixed);
  }

  if (trimmed.startsWith('/uploads/') && API_BASE_URL.startsWith('http')) {
    try {
      const api = new URL(API_BASE_URL);
      const port = api.port ? `:${api.port}` : '';
      return `${api.protocol}//${api.hostname}${port}${trimmed}`;
    } catch {
      return trimmed;
    }
  }

  if (trimmed.startsWith('uploads/') && API_BASE_URL.startsWith('http')) {
    return resolveAbsoluteUploadImageUrl(`/${trimmed}`);
  }

  return trimmed;
}

/** Rewrite backend upload URLs that still use localhost/127.0.0.1 for weapp LAN dev. */
export function rewriteLocalDevUploadHost(src: string): string {
  if (!API_BASE_URL.startsWith('http')) return src;
  try {
    const api = new URL(API_BASE_URL);
    const url = new URL(src);
    if (url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
      return src;
    }
    url.protocol = api.protocol;
    url.hostname = api.hostname;
    url.port = api.port;
    return url.toString();
  } catch {
    return src;
  }
}

/** Map legacy Unsplash URLs to stable picsum.photos (WeChat-safe). */
export function sanitizeRemoteImageUrl(src: string | undefined): string | undefined {
  if (!src?.trim()) return undefined;
  let trimmed = resolveAbsoluteUploadImageUrl(src);
  if (!/^https?:\/\//i.test(trimmed)) return trimmed;

  trimmed = rewriteLocalDevUploadHost(trimmed);

  try {
    const url = new URL(trimmed);
    if (!url.hostname.includes('unsplash.com')) {
      return trimmed;
    }

    const photoId = extractUnsplashPhotoId(url);
    if (photoId && BROKEN_UNSPLASH_PHOTO_IDS.has(photoId)) {
      return picsumUrl('edc-festival', 800, 600);
    }

    const { width, height } = unsplashDimensions(url);
    const seed = photoId ? `unsplash-${photoId}` : 'sync-image';
    return picsumUrl(seed, width, height);
  } catch {
    return trimmed;
  }
}

function isDisplayableFeedImageUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (/^wxfile:\/\//i.test(trimmed) || /^blob:/i.test(trimmed)) return false;
  if (/^data:/i.test(trimmed)) return false;
  try {
    if (/^https?:\/\//i.test(trimmed)) {
      const host = new URL(trimmed).hostname.toLowerCase();
      if (host === 'tmp' || host === 'usr' || host === 'store') return false;
    }
  } catch {
    return false;
  }
  return true;
}

export function sanitizeImageList(images: string[] | undefined): string[] | undefined {
  if (!images?.length) return images;
  const next = images
    .filter((url) => isDisplayableFeedImageUrl(url))
    .map((url) => sanitizeRemoteImageUrl(url) ?? url)
    .filter((url) => Boolean(url));
  return next.length ? next : undefined;
}

/** Resize remote list thumbnails when the CDN supports path or query params. */
export function thumbnailImageUrl(
  src: string | undefined,
  width = 240,
  heightRatio = 0.75,
): string | undefined {
  const sanitized = sanitizeRemoteImageUrl(src);
  if (!sanitized?.trim()) return undefined;
  const trimmed = sanitized.trim();
  if (!/^https?:\/\//i.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    const height = Math.round(width * heightRatio);

    if (url.hostname.includes('picsum.photos')) {
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts[0] === 'seed' && parts[1]) {
        return picsumUrl(parts[1], width, height);
      }
    }

    if (url.pathname.includes('/uploads/')) {
      return trimmed;
    }

    const host = url.hostname;
    if (host.includes('imagekit.io')) {
      if (!url.searchParams.has('tr')) {
        url.searchParams.set('tr', `w-${width},h-${height},c-at_max`);
      }
      return url.toString();
    }

    if (
      host.includes('alicdn.com') ||
      host.includes('tbcdn.cn') ||
      host.includes('aliyuncs.com')
    ) {
      if (!url.searchParams.has('x-oss-process')) {
        url.searchParams.set(
          'x-oss-process',
          `image/resize,m_fill,w_${width},h_${height}`,
        );
      }
      return url.toString();
    }

    if (url.searchParams.has('w')) {
      return trimmed;
    }
    url.searchParams.set('w', String(width));
    return url.toString();
  } catch {
    return trimmed;
  }
}

/** Featured post hero (16:10 tile). WeChat reliably loads resized picsum, not raw 800px URLs. */
export function featuredPostImageUrl(
  src: string | undefined,
  width = 480,
): string | undefined {
  return thumbnailImageUrl(src, width, 10 / 16);
}
