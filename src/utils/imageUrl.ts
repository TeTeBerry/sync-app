import { API_BASE_URL } from '../constants/api';
import { isCloudStorageFileId } from './cloudImage';

export { isCloudStorageFileId } from './cloudImage';

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

/** CloudBase personality-test avatar object key (not a local bundle path). */
export function isPersonalityAvatarAssetKey(src: string | undefined): boolean {
  return Boolean(src?.trim().startsWith('avatar/'));
}

/** CloudBase lineup artist avatar object key stored in MongoDB. */
export function isLineupAvatarAssetKey(src: string | undefined): boolean {
  return Boolean(src?.trim().startsWith('lineup-avatar/'));
}

/** ImageWithFallback display `src`: block unresolved cloud references. */
export function resolveImageWithFallbackDisplaySrc(
  resolvedSrc: string | undefined,
): string | undefined {
  const trimmed = resolvedSrc?.trim();
  if (!trimmed) return undefined;
  if (
    isCloudStorageFileId(trimmed) ||
    isPersonalityAvatarAssetKey(trimmed) ||
    isLineupAvatarAssetKey(trimmed)
  ) {
    return undefined;
  }
  return trimmed;
}

/** Avatar `Image` src: prefer resolved HTTPS URL; never expose unresolved storage keys. */
export function resolveAvatarDisplaySrc(
  resolvedSrc: string | undefined,
  rawSrc?: string,
  fallback = '',
): string {
  const resolved = resolvedSrc?.trim();
  if (resolved) return resolved;

  const raw = rawSrc?.trim();
  if (
    !raw ||
    isPersonalityAvatarAssetKey(raw) ||
    isLineupAvatarAssetKey(raw) ||
    isCloudStorageFileId(raw)
  ) {
    return fallback;
  }

  return sanitizeRemoteImageUrl(raw) ?? raw;
}

/** Resolve `/uploads/...` against API host (local Nest dev only). */
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
  const raw = src.trim();
  if (isCloudStorageFileId(raw)) return raw;
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

/** Resize remote list thumbnails when the CDN supports path or query params. */
export function isTencentCosImageHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host.endsWith('.myqcloud.com') ||
    host.endsWith('.file.myqcloud.com') ||
    host.endsWith('.tcb.qcloud.la') ||
    host.endsWith('.qcloud.la')
  );
}

function appendTencentCosThumbnail(url: URL, width: number, height: number): string {
  const search = url.search.slice(1);
  if (search.includes('imageView2') || search.includes('imageMogr2')) {
    return url.toString();
  }

  const rule = `imageView2/2/w/${width}/h/${height}/q/90`;
  url.search = search ? `?${search}&${rule}` : `?${rule}`;
  return url.toString();
}

/** Activity/event hero covers — full CDN resolution, no imageView2 resize. */
export function activityCoverImageUrl(src: string | undefined): string | undefined {
  return sanitizeRemoteImageUrl(src);
}

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

    const host = url.hostname;
    if (isTencentCosImageHost(host)) {
      return appendTencentCosThumbnail(url, width, height);
    }

    if (url.pathname.includes('/uploads/')) {
      return trimmed;
    }

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
