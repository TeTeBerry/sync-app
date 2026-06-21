import { t } from '@/i18n';
import type { PersonalityTestCatalog } from '../personalityTestCatalog';
import { getPersonalityMeta } from '../personalityTestCatalog';
import type { PersonalityTestResult, RaverPersonalityType } from '../types';
import { ROUTES } from '@/utils/route';
import { buildQueryString } from '@/utils/queryString';

const RAVER_PERSONALITY_TYPES: RaverPersonalityType[] = [
  'rager',
  'connoisseur',
  'vibe_curator',
  'zen_raver',
  'documentarian',
];

export type PersonalityTestShareQuery = {
  primaryType: RaverPersonalityType;
  soulDjId?: string;
};

export type PersonalityTestShareTeaser = {
  primaryType: RaverPersonalityType;
  typeLabel: string;
  typeEmoji: string;
  soulDjName?: string;
};

function isRaverPersonalityType(value: string): value is RaverPersonalityType {
  return RAVER_PERSONALITY_TYPES.includes(value as RaverPersonalityType);
}

export function buildPersonalityTestShareTitle(
  result: PersonalityTestResult,
  catalog?: PersonalityTestCatalog | null,
): string {
  const label = catalog
    ? getPersonalityMeta(catalog, result.score.primaryType).label
    : result.score.primaryType;
  return t('personality.shareTitle', { label });
}

export function buildPersonalityTestSharePath(result: PersonalityTestResult): string {
  const soulDjId = result.recommendations.soulMatch.djId?.trim();
  const query: Record<string, string | undefined> = {
    share: '1',
    primaryType: result.score.primaryType,
    soulDjId: soulDjId || undefined,
  };
  const qs = buildQueryString(query);
  return qs ? `${ROUTES.PERSONALITY_TEST}?${qs}` : ROUTES.PERSONALITY_TEST;
}

export function buildPersonalityTestShareAppMessage(result: PersonalityTestResult) {
  return {
    title: buildPersonalityTestShareTitle(result),
    path: buildPersonalityTestSharePath(result),
  };
}

export function buildPersonalityTestShareTimeline(result: PersonalityTestResult) {
  const query = buildPersonalityTestSharePath(result).split('?')[1] ?? '';
  return {
    title: buildPersonalityTestShareTitle(result),
    query,
  };
}

export function parsePersonalityTestShareQuery(
  params: Record<string, string | undefined>,
): PersonalityTestShareQuery | null {
  if (params.share !== '1') {
    return null;
  }
  const primaryType = params.primaryType?.trim() ?? '';
  if (!isRaverPersonalityType(primaryType)) {
    return null;
  }
  const soulDjId = params.soulDjId?.trim();
  return {
    primaryType,
    soulDjId: soulDjId || undefined,
  };
}

export function resolvePersonalityShareTeaser(
  catalog: PersonalityTestCatalog,
  parsed: PersonalityTestShareQuery,
): PersonalityTestShareTeaser {
  const meta = getPersonalityMeta(catalog, parsed.primaryType);
  const dj = parsed.soulDjId
    ? catalog.fallbackLineup.find((item) => item.id === parsed.soulDjId)
    : undefined;
  return {
    primaryType: parsed.primaryType,
    typeLabel: meta.label,
    typeEmoji: meta.emoji,
    soulDjName: dj?.name ?? parsed.soulDjId,
  };
}

function buildShareFallbackTitle(): string {
  return `${t('personality.raverPersonality')} · ${t('personality.shareFallbackSuffix')}`;
}

export function buildPersonalityTestShareFallback() {
  return {
    title: buildShareFallbackTitle(),
    path: ROUTES.PERSONALITY_TEST,
  };
}

export function buildPersonalityTestTimelineFallback() {
  return {
    title: buildShareFallbackTitle(),
  };
}
