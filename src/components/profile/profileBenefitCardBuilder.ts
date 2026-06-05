import type {
  EventPackageEntitlement,
  FreeMonthlyQuota,
  PackageTierId,
  ProfileActivityItem,
} from '../../types/backend';
import { safeTrim } from '../../utils/safeString';
import type { ProfileBenefits } from './profileBenefitsTypes';
import { MOCK_PACKAGE_CATALOG } from './profilePackageData';
import type {
  ProfileEventBenefitRow,
  ProfileEventBenefitCardModel,
  ProfileFreeBenefitQuota,
  ProfileFreeBenefitCardModel,
} from './profileBenefitsTypes';
import {
  FREE_MONTHLY_AI_LIMIT,
  FREE_MONTHLY_CONTACT_LIMIT,
  buildMetricsFromQuotas,
  hasValidEntitlementQuotas,
  isPaidEntitlement,
  isValidFreeMonthlyQuota,
  mapDaysRemaining,
  quotaLow,
  quotaRatio,
  resolveEntitlementQuotas,
  resolveEntitlementValidUntilIso,
} from './profileEntitlementMapper';

const GLOBAL_FREE_CARD_TITLE = '通场免费额度';
const GLOBAL_FREE_CARD_SUBTITLE = '每月重置';

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
