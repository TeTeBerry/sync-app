import { PLACEHOLDER_EVENT_HERO } from './remoteImages';
import { thumbnailImageUrl } from '../utils/imageUrl';

/** Resolve list/card thumb: resized remote from API, then network placeholder (no bundled JPEGs). */
export function resolveActivityThumb(
  _legacyId: number | null | undefined,
  remoteUrl?: string,
  width = 200,
): string {
  const remote = thumbnailImageUrl(remoteUrl, width);
  if (remote) return remote;
  return thumbnailImageUrl(PLACEHOLDER_EVENT_HERO, width) ?? PLACEHOLDER_EVENT_HERO;
}
