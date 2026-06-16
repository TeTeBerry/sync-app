import Taro from '@tarojs/taro';
import { fetchPersonalityTestCatalog } from '@/api/sync/personalityTest';
import type {
  DjSoulProfile,
  PersonalityLineupDj,
  PersonalityTypeMeta,
  RaverPersonalityType,
} from './types';

export type PersonalityTestCatalog = {
  version: number;
  types: PersonalityTypeMeta[];
  fallbackLineup: PersonalityLineupDj[];
  soulProfiles: Record<string, DjSoulProfile>;
  defaultSoulProfile: DjSoulProfile;
};

const STORAGE_KEY = 'sync.personalityTest.catalog';

let memoryCache: PersonalityTestCatalog | null = null;

export function buildTypeMetaMap(
  catalog: PersonalityTestCatalog,
): Record<RaverPersonalityType, PersonalityTypeMeta> {
  return Object.fromEntries(catalog.types.map((meta) => [meta.type, meta])) as Record<
    RaverPersonalityType,
    PersonalityTypeMeta
  >;
}

export function getPersonalityMeta(
  catalog: PersonalityTestCatalog,
  type: RaverPersonalityType,
): PersonalityTypeMeta {
  const map = buildTypeMetaMap(catalog);
  const meta = map[type];
  if (!meta) {
    throw new Error(`Unknown personality type: ${type}`);
  }
  return meta;
}

export function getDjSoulProfile(
  catalog: PersonalityTestCatalog,
  djId: string,
): DjSoulProfile {
  return catalog.soulProfiles[djId] ?? catalog.defaultSoulProfile;
}

export function getCachedPersonalityTestCatalog(): PersonalityTestCatalog | null {
  return memoryCache;
}

export async function loadPersonalityTestCatalog(
  options: { force?: boolean } = {},
): Promise<PersonalityTestCatalog> {
  if (memoryCache && !options.force) {
    return memoryCache;
  }

  if (!options.force) {
    try {
      const stored = Taro.getStorageSync(STORAGE_KEY) as
        | PersonalityTestCatalog
        | undefined;
      if (stored?.version && stored.types?.length) {
        memoryCache = stored;
        return stored;
      }
    } catch {
      // ignore cache read errors
    }
  }

  const catalog = await fetchPersonalityTestCatalog();
  memoryCache = catalog;
  try {
    Taro.setStorageSync(STORAGE_KEY, catalog);
  } catch {
    // ignore cache write errors
  }
  return catalog;
}

export function clearPersonalityTestCatalogCache(): void {
  memoryCache = null;
  try {
    Taro.removeStorageSync(STORAGE_KEY);
  } catch {
    // ignore
  }
}
