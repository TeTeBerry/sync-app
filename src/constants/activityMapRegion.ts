export type ActivityMapRegion = 'domestic' | 'overseas' | 'hmt';

export const ACTIVITY_MAP_REGIONS: readonly ActivityMapRegion[] = [
  'domestic',
  'overseas',
  'hmt',
] as const;

export const ACTIVITY_MAP_REGION_LABELS: Record<ActivityMapRegion, string> = {
  domestic: '国内',
  overseas: '海外',
  hmt: '港澳台',
};

/** Align with backend `DOMESTIC_ACTIVITY_CODES` in travel-guide-international.util.ts */
const DOMESTIC_TRAVEL_GUIDE_ACTIVITY_CODES = new Set([
  'storm',
  'tomorrowland-shanghai',
]);

const ACTIVITY_REGION_FALLBACK_BY_LEGACY_ID: Partial<
  Record<number, ActivityMapRegion>
> = {
  1: 'overseas',
  4: 'domestic',
  5: 'overseas',
  16: 'domestic',
};

export type ActivityMapRegionInput = {
  region?: ActivityMapRegion | null;
  code?: string | null;
  location?: string | null;
  name?: string | null;
  legacyId?: number | null;
};

function activityMapRegionCorpus(input: ActivityMapRegionInput): string {
  return `${input.name ?? ''} ${input.location ?? ''}`.toLowerCase();
}

function inferActivityMapRegionFromCorpus(corpus: string): ActivityMapRegion | null {
  if (/香港|澳门|台湾|hong kong|macau|taipei|台北/.test(corpus)) {
    return 'hmt';
  }
  if (
    /泰国|曼谷|韩国|首尔|日本|东京|大阪|荷兰|比利时|克罗地亚|美国|奥兰多|罗马尼亚|迪拜|沙特|英国|比丁赫伊普|walibi|split|斯普利特/.test(
      corpus,
    )
  ) {
    return 'overseas';
  }
  if (
    /上海|深圳|北京|广州|珠海|成都|杭州|重庆|武汉|南京|西安|厦门|苏州|天津|青岛/.test(
      corpus,
    )
  ) {
    return 'domestic';
  }
  return null;
}

/**
 * Resolve catalog region for map filters and travel-guide form toggles.
 * Mirrors backend `travelGuideRegionKind` when `region` is missing on cached rows.
 */
export function resolveActivityMapRegion(
  input?: ActivityMapRegion | ActivityMapRegionInput | null,
): ActivityMapRegion | undefined {
  if (input == null) {
    return undefined;
  }
  if (typeof input === 'string') {
    return input;
  }

  const explicit = input.region ?? undefined;
  if (explicit === 'overseas' || explicit === 'hmt') {
    return explicit;
  }

  const code = input.code?.trim();
  if (code && DOMESTIC_TRAVEL_GUIDE_ACTIVITY_CODES.has(code)) {
    return 'domestic';
  }

  const legacyFallback =
    input.legacyId != null
      ? ACTIVITY_REGION_FALLBACK_BY_LEGACY_ID[input.legacyId]
      : undefined;
  if (legacyFallback) {
    return legacyFallback;
  }

  const inferred = inferActivityMapRegionFromCorpus(activityMapRegionCorpus(input));
  if (inferred) {
    return inferred;
  }

  if (explicit === 'domestic') {
    return 'domestic';
  }

  return 'domestic';
}

/** 国内活动出行攻略表单展示自驾 / 住宿开关。 */
export function shouldShowTravelGuideDomesticOptions(
  input?: ActivityMapRegion | ActivityMapRegionInput | null,
): boolean {
  return resolveActivityMapRegion(input) === 'domestic';
}
