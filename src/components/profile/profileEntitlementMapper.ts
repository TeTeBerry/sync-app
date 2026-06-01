import type {
  EventPackageEntitlement,
  FreeMonthlyQuota,
  PackageTierId,
  ProfileActivityItem,
} from '../../types/backend';
import { safeFiniteNumber, safeTrim } from '../../utils/safeString';
import { PROFILE_SEED_ACTIVITY_LEGACY_ID } from '../../constants/profilePackage';
import { MOCK_PACKAGE_CATALOG, PACKAGE_TIER_ORDER } from './profilePackageData';
import type { ProfileBenefits } from './mockData';
import type {
  ProfileBenefitRowAccent,
  ProfileEventBenefitRow,
  ProfileEventBenefitCardModel,
  ProfileFreeBenefitQuota,
  ProfileFreeBenefitCardModel,
} from './profileBenefitsTypes';

const GLOBAL_FREE_CARD_TITLE = '通场免费额度';
const GLOBAL_FREE_CARD_SUBTITLE = '每月重置';

export const FREE_MONTHLY_AI_LIMIT = 3;
export const FREE_MONTHLY_CONTACT_LIMIT = 3;

export const MOCK_PROFILE_SEED_ACTIVITY_LEGACY_ID = PROFILE_SEED_ACTIVITY_LEGACY_ID;

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

export function resolveEntitlementQuotas(
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

export function quotaRatio(remaining: number | null, limit: number | null): number {
  if (limit == null || limit <= 0) {
    return remaining == null ? 1 : Math.min(1, remaining > 0 ? 1 : 0);
  }
  if (remaining == null) return 1;
  return Math.max(0, Math.min(1, remaining / limit));
}

export function quotaLow(remaining: number | null, limit: number | null): boolean {
  if (remaining == null) return false;
  if (limit == null || limit <= 0) return remaining <= 1;
  return remaining <= Math.max(1, Math.ceil(limit * 0.2));
}

export function mapDaysRemaining(expiresAt: string): number {
  const ms = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

function displayQuotaValue(remaining: number | null): { value: number; unit: string } {
  if (remaining == null) {
    return { value: 0, unit: '不限' };
  }
  return { value: remaining, unit: '次' };
}

export function buildMetricsFromQuotas(
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
