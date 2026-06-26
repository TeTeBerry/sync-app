import { PLUR_PEACE_ENTRY_COVER_KEY } from '@/constants/plurAssets';
import {
  getCachedPersonalityMediaUrl,
  resolvePersonalityMediaUrl,
} from '@/domains/personality-test/utils/resolvePersonalityMedia';

/** Warm peace entry cover URL before PlurEntrySheet or share cards need it. */
export function prefetchPlurPeaceCoverMedia(): void {
  void resolvePersonalityMediaUrl(PLUR_PEACE_ENTRY_COVER_KEY);
}

/** Optional Peace still for WeChat share cards (US-Q2-63). */
export function buildPlurPeaceShareImageUrl(): string | undefined {
  const url = getCachedPersonalityMediaUrl(PLUR_PEACE_ENTRY_COVER_KEY);
  return url || undefined;
}
