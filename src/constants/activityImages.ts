import { PLACEHOLDER_EVENT_HERO } from './remoteImages';
import { thumbnailImageUrl } from '../utils/imageUrl';

/** Activity covers: remote HTTPS from API/seed only (no COS catalog). */
export function resolveActivityThumb(remoteUrl?: string, width = 200): string {
  const trimmed = remoteUrl?.trim();
  if (trimmed) {
    return thumbnailImageUrl(trimmed, width) ?? trimmed;
  }
  return thumbnailImageUrl(PLACEHOLDER_EVENT_HERO, width) ?? PLACEHOLDER_EVENT_HERO;
}
