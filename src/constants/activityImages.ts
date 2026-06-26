import { PLACEHOLDER_EVENT_HERO } from './remoteImages';
import { activityCoverImageUrl } from '../utils/imageUrl';

/** Activity covers: remote HTTPS from API/seed only — full resolution at display. */
export function resolveActivityCover(remoteUrl?: string): string {
  const trimmed = remoteUrl?.trim();
  if (trimmed) {
    return activityCoverImageUrl(trimmed) ?? trimmed;
  }
  return activityCoverImageUrl(PLACEHOLDER_EVENT_HERO) ?? PLACEHOLDER_EVENT_HERO;
}

/** @deprecated use resolveActivityCover */
export function resolveActivityThumb(remoteUrl?: string): string {
  return resolveActivityCover(remoteUrl);
}
