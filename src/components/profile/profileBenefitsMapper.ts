import type {
  EventPackageEntitlement,
  FreeMonthlyQuota,
  PackageTierId,
  ProfileActivityItem,
} from '../../types/backend';
import { safeFiniteNumber, safeTrim } from '../../utils/safeString';
import type { ProfileBenefits } from './mockData';
import { PROFILE_SEED_ACTIVITY_LEGACY_ID } from '../../constants/profilePackage';
import { MOCK_PACKAGE_CATALOG, PACKAGE_TIER_ORDER } from './profilePackageData';

export type ProfileBenefitRowAccent = 'purple' | 'pink' | 'map' | 'gold';

export type ProfileBenefitQuotaTone = 'accent' | 'muted';

export type ProfileEventBenefitRow = {
  id: string;
  label: string;
  quotaLabel: string;
  remainingRatio: number;
  accent: ProfileBenefitRowAccent;
  /** Quota text color; contact rows use muted gray per design. */
  quotaTone?: ProfileBenefitQuotaTone;
  hint?: string;
  /** When false, omit progress bar (e.g. map 当日有效). */
  showBar?: boolean;
};

export type ProfileEventBenefitCardModel = {
  activityLegacyId: number;
  eventTitle: string;
  eventMeta: string;
  eventImage: string;
  tierId: PackageTierId;
  tierName: string;
  validUntilLabel: string;
  rows: ProfileEventBenefitRow[];
};

export type ProfileFreeBenefitQuota = {
  remaining: number;
  limit: number;
  remainingRatio: number;
};

export type ProfileFreeBenefitCardModel = {
  /** Global free tier label (not tied to an activity). */
  title: string;
  /** e.g. 每月重置 for venue-wide monthly quotas. */
  subtitle: string;
  aiMatch: ProfileFreeBenefitQuota;
  contactUnlock: ProfileFreeBenefitQuota;
  upsellText: string;
};

const GLOBAL_FREE_CARD_TITLE = '通场免费额度';
const GLOBAL_FREE_CARD_SUBTITLE = '每月重置';

const FREE_MONTHLY_AI_LIMIT = 3;
const FREE_MONTHLY_CONTACT_LIMIT = 3;

const MOCK_PROFILE_SEED_ACTIVITY_LEGACY_ID = PROFILE_SEED_ACTIVITY_LEGACY_ID;

const EMPTY_QUOTAS: EventPackageEntitlement['quotas'] = {
  aiMatch: { limit: 0, used: 0, remaining: 0 },
  contactUnlock: { limit: 0, used: 0, remaining: 0 },
  map: {
    days: 0,
    expiresAt: new Date(0).toISOString(),
    active: false,
  },
  postPin: { limit: 0, used: 0, remaining: 0 },
  basicExposure: false,
};

function isValidQuotaSlot(slot: unknown): boolean {
  if (!slot || typeof slot !== 'object') {
    return false;
  }
  const record = slot as {
    limit?: unknown;
    used?: unknown;
    remaining?: unknown;
  };
  const { limit, used, remaining } = record;
  return (
    (limit === null || typeof limit === 'number') &&
    (remaining === null || typeof remaining === 'number') &&
    (used === undefined || typeof used === 'number')
  );
}

function isValidMapQuotaSlot(map: unknown): boolean {
  if (!map || typeof map !== 'object') {
    return false;
  }
  const record = map as { active?: unknown; expiresAt?: unknown; days?: unknown };
  return (
    typeof record.active === 'boolean' &&
    typeof record.expiresAt === 'string' &&
    (record.days === undefined || typeof record.days === 'number')
  );
}

/** Coerce API payloads to an array (never throws on object/null). */
export function asEntitlementList(value: unknown): EventPackageEntitlement[] {
  if (Array.isArray(value)) {
    return value;
  }
  if (value != null && typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).filter(
      (item): item is EventPackageEntitlement =>
        item != null && typeof item === 'object',
    );
  }
  return [];
}

export function hasValidEntitlementQuotas(
  entitlement: EventPackageEntitlement | null | undefined,
): entitlement is EventPackageEntitlement {
  const quotas = entitlement?.quotas;
  if (!quotas) {
    return false;
  }
  return (
    isValidQuotaSlot(quotas.aiMatch) &&
    isValidQuotaSlot(quotas.contactUnlock) &&
    isValidMapQuotaSlot(quotas.map)
  );
}

export function isValidFreeMonthlyQuota(
  freeMonthly: FreeMonthlyQuota | null | undefined,
): freeMonthly is FreeMonthlyQuota {
  return Boolean(
    freeMonthly?.aiMatch &&
    freeMonthly?.contactUnlock &&
    typeof freeMonthly.period === 'string',
  );
}

function normalizeQuotaSlot(
  slot: EventPackageEntitlement['quotas']['aiMatch'] | undefined,
  fallback: EventPackageEntitlement['quotas']['aiMatch'],
): EventPackageEntitlement['quotas']['aiMatch'] {
  if (!slot) {
    return fallback;
  }
  return {
    limit:
      slot.limit === null ? null : safeFiniteNumber(slot.limit, fallback.limit ?? 0),
    used: safeFiniteNumber(slot.used, 0),
    remaining:
      slot.remaining === null
        ? null
        : safeFiniteNumber(slot.remaining, fallback.remaining ?? 0),
  };
}

function resolveEntitlementQuotas(
  entitlement: EventPackageEntitlement,
): EventPackageEntitlement['quotas'] {
  if (!hasValidEntitlementQuotas(entitlement)) {
    return EMPTY_QUOTAS;
  }
  const quotas = entitlement.quotas;
  return {
    aiMatch: normalizeQuotaSlot(quotas.aiMatch, EMPTY_QUOTAS.aiMatch),
    contactUnlock: normalizeQuotaSlot(quotas.contactUnlock, EMPTY_QUOTAS.contactUnlock),
    map: {
      days: safeFiniteNumber(quotas.map.days, 0),
      expiresAt:
        typeof quotas.map.expiresAt === 'string' && quotas.map.expiresAt
          ? quotas.map.expiresAt
          : EMPTY_QUOTAS.map.expiresAt,
      active: Boolean(quotas.map.active),
    },
    postPin: normalizeQuotaSlot(quotas.postPin, EMPTY_QUOTAS.postPin),
    basicExposure: Boolean(quotas.basicExposure),
  };
}

/** Per-activity package validity from purchase (matches backend). */
const PACKAGE_ENTITLEMENT_VALIDITY_DAYS = 30;

function addUtcDaysFromIso(iso: string, days: number): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString();
}

export function resolveEntitlementValidUntilIso(
  entitlement: Pick<EventPackageEntitlement, 'validUntil' | 'purchasedAt'>,
): string | undefined {
  if (entitlement.validUntil) {
    return entitlement.validUntil;
  }
  if (entitlement.purchasedAt) {
    return addUtcDaysFromIso(
      entitlement.purchasedAt,
      PACKAGE_ENTITLEMENT_VALIDITY_DAYS,
    );
  }
  return undefined;
}

function quotaRatio(remaining: number | null, limit: number | null): number {
  if (limit == null || limit <= 0) {
    return remaining == null ? 1 : Math.min(1, remaining > 0 ? 1 : 0);
  }
  if (remaining == null) return 1;
  return Math.max(0, Math.min(1, remaining / limit));
}

function quotaLow(remaining: number | null, limit: number | null): boolean {
  if (remaining == null) return false;
  if (limit == null || limit <= 0) return remaining <= 1;
  return remaining <= Math.max(1, Math.ceil(limit * 0.2));
}

function mapDaysRemaining(expiresAt: string): number {
  const ms = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

function displayQuotaValue(remaining: number | null): { value: number; unit: string } {
  if (remaining == null) {
    return { value: 0, unit: '不限' };
  }
  return { value: remaining, unit: '次' };
}

function buildMetricsFromQuotas(
  quotas: EventPackageEntitlement['quotas'],
): ProfileBenefits['metrics'] {
  const ai = displayQuotaValue(quotas.aiMatch.remaining);
  const contact = displayQuotaValue(quotas.contactUnlock.remaining);
  const mapDaysLeft = quotas.map.active ? mapDaysRemaining(quotas.map.expiresAt) : 0;
  const mapLimit = quotas.map.days;

  return [
    {
      id: 'ai-match',
      kind: 'match',
      value: ai.value,
      unit: ai.unit,
      label: 'AI 匹配剩余',
      remainingRatio: quotaRatio(quotas.aiMatch.remaining, quotas.aiMatch.limit),
      lowRemaining: quotaLow(quotas.aiMatch.remaining, quotas.aiMatch.limit),
    },
    {
      id: 'contact',
      kind: 'contact',
      value: contact.value,
      unit: contact.unit,
      label: '联系方式解锁',
      remainingRatio: quotaRatio(
        quotas.contactUnlock.remaining,
        quotas.contactUnlock.limit,
      ),
      lowRemaining: quotaLow(
        quotas.contactUnlock.remaining,
        quotas.contactUnlock.limit,
      ),
    },
    {
      id: 'map',
      kind: 'duration',
      value: mapDaysLeft,
      unit: '天',
      label: '点位地图剩余',
      remainingRatio: mapLimit > 0 ? Math.min(1, mapDaysLeft / mapLimit) : 0,
      lowRemaining: mapDaysLeft <= 2 && quotas.map.active,
    },
  ];
}

/** Offline / demo Zara — Pro per-event tier merged with full free monthly bucket. */
export function buildMockProfileBenefits(): ProfileBenefits {
  const proTier =
    MOCK_PACKAGE_CATALOG.tiers.find((tier) => tier.id === 'pro') ??
    MOCK_PACKAGE_CATALOG.tiers[0];
  const aiRemaining = (proTier.limits.aiMatchCount ?? 0) + FREE_MONTHLY_AI_LIMIT;
  const contactRemaining =
    (proTier.limits.contactUnlockCount ?? 0) + FREE_MONTHLY_CONTACT_LIMIT;
  const mapDays = proTier.limits.mapDays;

  return {
    planLabel: proTier.name,
    upgradeLabel: '更换套餐',
    promo: {
      prefix: '当前场次套餐 · ',
      highlight: proTier.name,
      suffix: ' · 含每月免费额度',
    },
    metrics: [
      {
        id: 'ai-match',
        kind: 'match',
        value: aiRemaining,
        unit: '次',
        label: 'AI 匹配剩余',
        remainingRatio: 1,
        lowRemaining: false,
      },
      {
        id: 'contact',
        kind: 'contact',
        value: contactRemaining,
        unit: '次',
        label: '联系方式解锁',
        remainingRatio: 1,
        lowRemaining: false,
      },
      {
        id: 'map',
        kind: 'duration',
        value: mapDays,
        unit: '天',
        label: '点位地图剩余',
        remainingRatio: 1,
        lowRemaining: false,
      },
    ],
  };
}

export function pickProfileEntitlement(
  activityLegacyId: number | undefined,
  entitlements: EventPackageEntitlement[] | undefined,
  summaryEntitlement: EventPackageEntitlement | null | undefined,
): EventPackageEntitlement | null {
  if (activityLegacyId != null && !Number.isNaN(activityLegacyId)) {
    const scoped = entitlements?.find(
      (item) => item.activityLegacyId === activityLegacyId,
    );
    if (scoped) {
      return scoped;
    }
    if (summaryEntitlement?.activityLegacyId === activityLegacyId) {
      return summaryEntitlement;
    }
    return null;
  }

  if (!entitlements?.length) {
    return summaryEntitlement ?? null;
  }

  return summaryEntitlement ?? entitlements[0] ?? null;
}

function slotToFreeQuota(
  remaining: number | null,
  limit: number | null,
  fallbackLimit: number,
): ProfileFreeBenefitQuota {
  const resolvedLimit = limit != null && limit > 0 ? limit : fallbackLimit;
  const resolvedRemaining =
    remaining != null ? Math.max(0, Math.min(resolvedLimit, remaining)) : resolvedLimit;
  return {
    remaining: resolvedRemaining,
    limit: resolvedLimit,
    remainingRatio: quotaRatio(resolvedRemaining, resolvedLimit),
  };
}

function resolveFreeQuotaSlots(
  entitlement: EventPackageEntitlement | null | undefined,
  freeMonthly?: FreeMonthlyQuota | null,
): Pick<ProfileFreeBenefitCardModel, 'aiMatch' | 'contactUnlock'> {
  const monthly = entitlement?.freeMonthly ?? freeMonthly ?? null;

  if (isValidFreeMonthlyQuota(monthly)) {
    return {
      aiMatch: slotToFreeQuota(
        monthly.aiMatch.remaining,
        monthly.aiMatch.limit,
        FREE_MONTHLY_AI_LIMIT,
      ),
      contactUnlock: slotToFreeQuota(
        monthly.contactUnlock.remaining,
        monthly.contactUnlock.limit,
        FREE_MONTHLY_CONTACT_LIMIT,
      ),
    };
  }

  if (
    entitlement &&
    !isPaidEntitlement(entitlement) &&
    hasValidEntitlementQuotas(entitlement)
  ) {
    return {
      aiMatch: slotToFreeQuota(
        entitlement.quotas.aiMatch.remaining,
        entitlement.quotas.aiMatch.limit,
        FREE_MONTHLY_AI_LIMIT,
      ),
      contactUnlock: slotToFreeQuota(
        entitlement.quotas.contactUnlock.remaining,
        entitlement.quotas.contactUnlock.limit,
        FREE_MONTHLY_CONTACT_LIMIT,
      ),
    };
  }

  return {
    aiMatch: slotToFreeQuota(null, null, FREE_MONTHLY_AI_LIMIT),
    contactUnlock: slotToFreeQuota(null, null, FREE_MONTHLY_CONTACT_LIMIT),
  };
}

export function buildProPlusUpsellText(): string {
  const proPlus =
    MOCK_PACKAGE_CATALOG.tiers.find((tier) => tier.id === 'pro_plus') ??
    MOCK_PACKAGE_CATALOG.tiers[1];
  const ai = proPlus.limits.aiMatchCount ?? 15;
  const contact = proPlus.limits.contactUnlockCount ?? 12;
  return `升级 Pro+ 享受 AI ${ai}次 + 解锁 ${contact}次`;
}

/** Global monthly free bucket from summary or any entitlement row (same for all activities). */
export function pickGlobalFreeMonthly(
  entitlements: EventPackageEntitlement[] | undefined | unknown,
  summaryFreeMonthly?: FreeMonthlyQuota | null,
): FreeMonthlyQuota | null | undefined {
  if (isValidFreeMonthlyQuota(summaryFreeMonthly)) {
    return summaryFreeMonthly;
  }
  for (const item of asEntitlementList(entitlements)) {
    if (isValidFreeMonthlyQuota(item.freeMonthly)) {
      return item.freeMonthly;
    }
  }
  return null;
}

export function buildFreeBenefitCardModel(
  freeMonthly: FreeMonthlyQuota | null | undefined,
): ProfileFreeBenefitCardModel {
  const quotas = resolveFreeQuotaSlots(null, freeMonthly);

  return {
    title: GLOBAL_FREE_CARD_TITLE,
    subtitle: GLOBAL_FREE_CARD_SUBTITLE,
    ...quotas,
    upsellText: buildProPlusUpsellText(),
  };
}

/** Offline fallback or missing API payload — assumes full free monthly bucket. */
export function buildFreeProfileBenefits(
  freeMonthly?: FreeMonthlyQuota | null,
): ProfileBenefits {
  const aiRemaining = freeMonthly?.aiMatch.remaining ?? FREE_MONTHLY_AI_LIMIT;
  const contactRemaining =
    freeMonthly?.contactUnlock.remaining ?? FREE_MONTHLY_CONTACT_LIMIT;
  const aiLimit = freeMonthly?.aiMatch.limit ?? FREE_MONTHLY_AI_LIMIT;
  const contactLimit = freeMonthly?.contactUnlock.limit ?? FREE_MONTHLY_CONTACT_LIMIT;

  return {
    planLabel: '免费版',
    upgradeLabel: '升级套餐',
    promo: {
      prefix: '每月免费额度 · ',
      highlight: 'AI 3 次',
      suffix: ' · 联系方式解锁 3 次',
    },
    metrics: [
      {
        id: 'ai-match',
        kind: 'match',
        value: aiRemaining,
        unit: '次',
        label: 'AI 匹配剩余',
        remainingRatio: quotaRatio(aiRemaining, aiLimit),
        lowRemaining: quotaLow(aiRemaining, aiLimit),
      },
      {
        id: 'contact',
        kind: 'contact',
        value: contactRemaining,
        unit: '次',
        label: '联系方式解锁',
        remainingRatio: quotaRatio(contactRemaining, contactLimit),
        lowRemaining: quotaLow(contactRemaining, contactLimit),
      },
      {
        id: 'map',
        kind: 'duration',
        value: 0,
        unit: '天',
        label: '点位地图剩余',
        remainingRatio: 0,
        lowRemaining: true,
      },
    ],
  };
}

export function isPaidEntitlement(entitlement: EventPackageEntitlement): boolean {
  return Boolean(entitlement.paidTierId) && entitlement.tierId !== 'free';
}

/** Next purchasable tier for upgrade CTA; `null` at Ultra (top tier). */
export function getNextTierId(
  paidTierId: PackageTierId | null | undefined,
): PackageTierId | null {
  if (!paidTierId) {
    return null;
  }
  const index = PACKAGE_TIER_ORDER.indexOf(paidTierId);
  if (index < 0 || index >= PACKAGE_TIER_ORDER.length - 1) {
    return null;
  }
  return PACKAGE_TIER_ORDER[index + 1] ?? null;
}

/** Deduped paid per-event entitlements (one card per activity). */
export function listPaidEntitlements(
  entitlements: EventPackageEntitlement[] | undefined,
  summaryEntitlements?: EventPackageEntitlement[] | null | unknown,
): EventPackageEntitlement[] {
  const byActivity = new Map<number, EventPackageEntitlement>();

  for (const item of asEntitlementList(summaryEntitlements)) {
    if (isPaidEntitlement(item) && hasValidEntitlementQuotas(item)) {
      byActivity.set(item.activityLegacyId, item);
    }
  }

  for (const item of asEntitlementList(entitlements)) {
    if (isPaidEntitlement(item) && hasValidEntitlementQuotas(item)) {
      byActivity.set(item.activityLegacyId, item);
    }
  }

  return Array.from(byActivity.values()).sort(
    (a, b) => a.activityLegacyId - b.activityLegacyId,
  );
}

function formatQuotaLabel(remaining: number | null, limit: number | null): string {
  if (limit == null) {
    return remaining == null ? '不限' : `剩 ${remaining} 次`;
  }
  if (limit <= 0) {
    return '未包含';
  }
  const left = remaining ?? Math.max(0, limit);
  return `剩 ${left}/${limit}`;
}

function formatValidUntilDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function buildMapBenefitRow(
  map: EventPackageEntitlement['quotas']['map'],
): ProfileEventBenefitRow {
  if (!map.active) {
    return {
      id: 'map',
      label: '地图同频雷达',
      quotaLabel: '未激活',
      remainingRatio: 0,
      accent: 'map',
    };
  }

  const daysLeft = mapDaysRemaining(map.expiresAt);
  const mapLimit = map.days;

  if (daysLeft <= 1) {
    return {
      id: 'map',
      label: '地图同频雷达',
      quotaLabel: '当日有效',
      remainingRatio: 1,
      accent: 'map',
      showBar: false,
      hint: '权益今日到期',
    };
  }

  return {
    id: 'map',
    label: '地图同频雷达',
    quotaLabel: `剩 ${daysLeft} 天`,
    remainingRatio: mapLimit > 0 ? Math.min(1, daysLeft / mapLimit) : 1,
    accent: 'map',
    hint: mapLimit > 1 ? `共 ${mapLimit} 天场次权益` : undefined,
  };
}

function tierIncludesPostPin(
  postPin: EventPackageEntitlement['quotas']['postPin'] | null | undefined,
): boolean {
  return (postPin?.limit ?? 0) > 0;
}

function resolvePaidTierDisplay(
  entitlement: EventPackageEntitlement,
): Pick<ProfileEventBenefitCardModel, 'tierId' | 'tierName'> {
  const tierId = (entitlement.paidTierId ?? entitlement.tierId) as PackageTierId;
  const catalogTier = MOCK_PACKAGE_CATALOG.tiers.find((tier) => tier.id === tierId);
  return {
    tierId,
    tierName: catalogTier?.name ?? entitlement.tierName,
  };
}

function buildPinBenefitRow(
  postPin: EventPackageEntitlement['quotas']['postPin'],
): ProfileEventBenefitRow {
  const { remaining, limit } = postPin;
  const ratio = quotaRatio(remaining, limit);

  return {
    id: 'post-pin',
    label: '主页置顶',
    quotaLabel:
      limit == null
        ? '不限'
        : limit <= 0
          ? '未包含'
          : formatQuotaLabel(remaining, limit),
    remainingRatio: limit != null && limit > 0 ? ratio : 0,
    accent: 'gold',
    hint: undefined,
  };
}

export function buildEventBenefitRows(
  quotas: EventPackageEntitlement['quotas'],
): ProfileEventBenefitRow[] {
  const rows: ProfileEventBenefitRow[] = [
    {
      id: 'contact',
      label: '联系方式解锁',
      quotaLabel: formatQuotaLabel(
        quotas.contactUnlock.remaining,
        quotas.contactUnlock.limit,
      ),
      remainingRatio: quotaRatio(
        quotas.contactUnlock.remaining,
        quotas.contactUnlock.limit,
      ),
      accent: 'purple',
      quotaTone: 'muted',
    },
    {
      id: 'ai-match',
      label: 'AI 智能匹配',
      quotaLabel: formatQuotaLabel(quotas.aiMatch.remaining, quotas.aiMatch.limit),
      remainingRatio: quotaRatio(quotas.aiMatch.remaining, quotas.aiMatch.limit),
      accent: 'pink',
    },
    buildMapBenefitRow(quotas.map),
  ];

  if (tierIncludesPostPin(quotas.postPin)) {
    rows.push(buildPinBenefitRow(quotas.postPin));
  }

  return rows;
}

/** Second offline card — Pro+ on VAC (activity 6) for “共 2 张” demo. */
export function buildMockProPlusEntitlement(): EventPackageEntitlement {
  const proPlusTier =
    MOCK_PACKAGE_CATALOG.tiers.find((tier) => tier.id === 'pro_plus') ??
    MOCK_PACKAGE_CATALOG.tiers[1];
  const aiLimit = proPlusTier.limits.aiMatchCount ?? 15;
  const contactLimit = proPlusTier.limits.contactUnlockCount ?? 12;
  const mapDays = proPlusTier.limits.mapDays;
  const pinLimit = proPlusTier.limits.postPinCount ?? 1;

  return {
    activityLegacyId: 6,
    tierId: 'pro_plus',
    tierName: proPlusTier.name,
    paidTierId: 'pro_plus',
    purchasedAt: new Date().toISOString(),
    quotas: {
      aiMatch: { limit: aiLimit, used: 3, remaining: aiLimit - 3 },
      contactUnlock: {
        limit: contactLimit,
        used: 2,
        remaining: contactLimit - 2,
      },
      map: {
        days: mapDays,
        expiresAt: new Date(Date.now() + mapDays * 86_400_000).toISOString(),
        active: true,
      },
      postPin: { limit: pinLimit, used: 0, remaining: pinLimit },
      basicExposure: false,
    },
  };
}

export function buildMockPaidEntitlement(): EventPackageEntitlement {
  const proTier =
    MOCK_PACKAGE_CATALOG.tiers.find((tier) => tier.id === 'pro') ??
    MOCK_PACKAGE_CATALOG.tiers[0];
  const aiLimit = (proTier.limits.aiMatchCount ?? 0) + FREE_MONTHLY_AI_LIMIT;
  const contactLimit =
    (proTier.limits.contactUnlockCount ?? 0) + FREE_MONTHLY_CONTACT_LIMIT;
  const mapDays = proTier.limits.mapDays;

  return {
    activityLegacyId: MOCK_PROFILE_SEED_ACTIVITY_LEGACY_ID,
    tierId: 'pro',
    tierName: proTier.name,
    paidTierId: 'pro',
    purchasedAt: new Date().toISOString(),
    quotas: {
      aiMatch: { limit: aiLimit, used: 0, remaining: aiLimit },
      contactUnlock: { limit: contactLimit, used: 0, remaining: contactLimit },
      map: {
        days: mapDays,
        expiresAt: new Date(Date.now() + mapDays * 86_400_000).toISOString(),
        active: true,
      },
      postPin: { limit: 0, used: 0, remaining: 0 },
      basicExposure: true,
    },
  };
}

export function buildEventBenefitCardModel(
  entitlement: EventPackageEntitlement,
  activity?: Partial<
    Pick<ProfileActivityItem, 'title' | 'date' | 'location' | 'image'>
  > | null,
): ProfileEventBenefitCardModel {
  const title = safeTrim(activity?.title) || `活动 ${entitlement.activityLegacyId}`;
  const date = safeTrim(activity?.date);
  const location = safeTrim(activity?.location);
  const eventMeta = [date, location].filter(Boolean).join(' · ');

  const quotas = resolveEntitlementQuotas(entitlement);
  const validUntilIso =
    resolveEntitlementValidUntilIso(entitlement) ?? quotas.map.expiresAt;

  const { tierId, tierName } = resolvePaidTierDisplay(entitlement);

  return {
    activityLegacyId: entitlement.activityLegacyId,
    eventTitle: title,
    eventMeta,
    eventImage:
      safeTrim(activity?.image) ||
      'https://picsum.photos/seed/sync-benefit-event/96/96',
    tierId,
    tierName,
    validUntilLabel: `权益有效期至 ${formatValidUntilDate(validUntilIso ?? '')}`,
    rows: buildEventBenefitRows(quotas),
  };
}

export function buildProfileBenefitsFromEntitlement(
  entitlement: EventPackageEntitlement,
): ProfileBenefits {
  const { tierName, tierId, paidTierId } = entitlement;
  const isFreeOnly = tierId === 'free' || !paidTierId;

  if (isFreeOnly) {
    return buildFreeProfileBenefits(entitlement.freeMonthly ?? null);
  }

  const quotas = resolveEntitlementQuotas(entitlement);

  return {
    planLabel: tierName,
    upgradeLabel: '更换套餐',
    promo: {
      prefix: '当前场次套餐 · ',
      highlight: tierName,
      suffix: ' · 含每月免费额度',
    },
    metrics: buildMetricsFromQuotas(quotas),
  };
}
