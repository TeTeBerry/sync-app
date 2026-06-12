import { API_BASE_URL } from '../constants/api';
import { isCloudStorageFileId } from './cloudImage';

/** Matches backend `isAllowedUserUploadImageRef` — cloud fileID or backend `/uploads/`. */
export function isTrustedUploadImageUrl(raw: string): boolean {
  const trimmed = raw.trim();
  if (isCloudStorageFileId(trimmed)) return true;
  if (!/^https?:\/\//i.test(trimmed)) return false;

  try {
    const parsed = new URL(trimmed);
    if (!parsed.pathname.includes('/uploads/')) return false;

    const base = API_BASE_URL.replace(/\/$/, '');
    if (base.startsWith('http')) {
      const api = new URL(base);
      if (parsed.hostname === api.hostname && parsed.port === api.port) {
        return true;
      }
    }

    if (parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost') {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}
