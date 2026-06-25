import { PLACEHOLDER_EVENT_HERO } from './remoteImages';
import { thumbnailImageUrl } from '../utils/imageUrl';

/** Activity covers: remote HTTPS from API/seed only. Prefer raw URL in mappers; resize at display. */
export function resolveActivityThumb(remoteUrl?: string, width = 750): string {
  const trimmed = remoteUrl?.trim();
  if (trimmed) {
    return thumbnailImageUrl(trimmed, width) ?? trimmed;
  }
  return thumbnailImageUrl(PLACEHOLDER_EVENT_HERO, width) ?? PLACEHOLDER_EVENT_HERO;
}
