import { API_BASE_URL } from '../constants/api';
import { COS_PUBLIC_BASE_URL } from '../constants/cos';

function isCosPostUploadImageUrl(parsed: URL): boolean {
  try {
    const cosHost = new URL(COS_PUBLIC_BASE_URL).hostname;
    if (parsed.hostname !== cosHost) return false;
    return parsed.pathname.replace(/\/+$/, '').startsWith('/uploads/');
  } catch {
    return false;
  }
}

/** Matches backend `isAllowedUserUploadImageUrl` — backend /uploads/ or COS post uploads. */
export function isTrustedUploadImageUrl(raw: string): boolean {
  const trimmed = raw.trim();
  if (!/^https?:\/\//i.test(trimmed)) return false;

  try {
    const parsed = new URL(trimmed);
    if (isCosPostUploadImageUrl(parsed)) return true;
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
