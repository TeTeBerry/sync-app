import type { PersonalityTestResult } from '../types';
import {
  RAVER_AVATAR_ASSET_KEYS,
  type RaverAvatarAssetKey,
} from '../data/personalityRaverAvatarCatalog';

function pickRandom<T>(items: readonly T[], random: () => number): T {
  const index = Math.floor(random() * items.length);
  return items[Math.min(Math.max(index, 0), items.length - 1)]!;
}

export function generatePersonalityRaverAvatarKey(
  random: () => number = Math.random,
): RaverAvatarAssetKey {
  return pickRandom(RAVER_AVATAR_ASSET_KEYS, random);
}

export function isCatalogAvatarKey(key: string): boolean {
  return (RAVER_AVATAR_ASSET_KEYS as readonly string[]).includes(key);
}

export function ensurePersonalityResultAvatar(
  result: PersonalityTestResult,
): PersonalityTestResult {
  const existing = result.raverAvatarKey?.trim();
  if (existing && isCatalogAvatarKey(existing)) {
    return result.raverAvatarKey === existing
      ? result
      : { ...result, raverAvatarKey: existing };
  }

  return {
    ...result,
    raverAvatarKey: generatePersonalityRaverAvatarKey(),
  };
}

export { RAVER_AVATAR_ASSET_KEYS } from '../data/personalityRaverAvatarCatalog';
