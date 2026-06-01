import type {
  FreeMonthlyQuota,
  PackageTierDefinition,
  PackageTierId,
  PackageTierLimits,
} from '../types/backend';
import { getNextTierId } from '../pages/profile/profileBenefitsMapper';

/** Matches backend `free-tier.config.ts` — monthly free bucket. */
export const FREE_MONTHLY_AI_MATCH_LIMIT = 3;
export const FREE_MONTHLY_CONTACT_UNLOCK_LIMIT = 3;

export type ContactUnlockUpgradeCompareRowId = 'contactUnlock' | 'aiMatch' | 'map';

export type ContactUnlockUpgradeCompareRow = {
  id: ContactUnlockUpgradeCompareRowId;
  label: string;
  current: string;
  target: string;
};

export type ContactUnlockUpgradeCompareModel = {
  targetTierId: PackageTierId;
  targetTierName: string;
  rows: ContactUnlockUpgradeCompareRow[];
};

function findTier(
  tiers: PackageTierDefinition[],
  tierId: PackageTierId,
): PackageTierDefinition | undefined {
  return tiers.find((tier) => tier.id === tierId);
}

/** Next purchasable tier when contact unlock is exhausted. */
export function resolveContactUnlockUpgradeTargetTier(
  paidTierId: PackageTierId | null | undefined,
): PackageTierId | null {
  if (!paidTierId) {
    return 'pro';
  }
  return getNextTierId(paidTierId);
}

function formatPerEventCount(value: number | null): string {
  if (value == null) {
    return '无限次';
  }
  return `${value}次/场`;
}

function formatMonthlyCount(value: number): string {
  return `${value}次/月`;
}

function formatMapLimit(limits: PackageTierLimits, isFreeTier: boolean): string {
  if (isFreeTier) {
    return '限量';
  }
  if (limits.contactUnlockCount == null) {
    return '无限使用';
  }
  return `${limits.mapDays}天`;
}

function resolveFreeMonthlyLimits(freeMonthly?: FreeMonthlyQuota | null): {
  aiMatch: number;
  contactUnlock: number;
} {
  return {
    aiMatch: freeMonthly?.aiMatch.limit ?? FREE_MONTHLY_AI_MATCH_LIMIT,
    contactUnlock:
      freeMonthly?.contactUnlock.limit ?? FREE_MONTHLY_CONTACT_UNLOCK_LIMIT,
  };
}

function buildCurrentColumn(
  paidTierId: PackageTierId | null | undefined,
  tiers: PackageTierDefinition[],
  freeMonthly?: FreeMonthlyQuota | null,
): Pick<ContactUnlockUpgradeCompareRow, 'current'> & {
  contactUnlock: string;
  aiMatch: string;
  map: string;
} {
  if (!paidTierId) {
    const free = resolveFreeMonthlyLimits(freeMonthly);
    return {
      current: '',
      contactUnlock: formatMonthlyCount(free.contactUnlock),
      aiMatch: formatMonthlyCount(free.aiMatch),
      map: '限量',
    };
  }

  const tier = findTier(tiers, paidTierId);
  if (!tier) {
    const free = resolveFreeMonthlyLimits(freeMonthly);
    return {
      current: '',
      contactUnlock: formatMonthlyCount(free.contactUnlock),
      aiMatch: formatMonthlyCount(free.aiMatch),
      map: '限量',
    };
  }

  return {
    current: '',
    contactUnlock: formatPerEventCount(tier.limits.contactUnlockCount),
    aiMatch: formatPerEventCount(tier.limits.aiMatchCount),
    map: formatMapLimit(tier.limits, false),
  };
}

function buildTargetColumn(targetTier: PackageTierDefinition): Pick<
  ContactUnlockUpgradeCompareRow,
  'target'
> & {
  contactUnlock: string;
  aiMatch: string;
  map: string;
} {
  return {
    target: '',
    contactUnlock: formatPerEventCount(targetTier.limits.contactUnlockCount),
    aiMatch: formatPerEventCount(targetTier.limits.aiMatchCount),
    map: formatMapLimit(targetTier.limits, false),
  };
}

/** Comparison rows for the contact-unlock exhausted upgrade modal (package catalog). */
export function buildContactUnlockUpgradeCompare(params: {
  tiers: PackageTierDefinition[];
  currentPaidTierId: PackageTierId | null | undefined;
  targetTierId: PackageTierId;
  freeMonthly?: FreeMonthlyQuota | null;
}): ContactUnlockUpgradeCompareModel | null {
  const { tiers, currentPaidTierId, targetTierId, freeMonthly } = params;
  const targetTier = findTier(tiers, targetTierId);
  if (!targetTier) {
    return null;
  }

  const current = buildCurrentColumn(currentPaidTierId, tiers, freeMonthly);
  const target = buildTargetColumn(targetTier);

  return {
    targetTierId,
    targetTierName: targetTier.name,
    rows: [
      {
        id: 'contactUnlock',
        label: '联系方式解锁',
        current: current.contactUnlock,
        target: target.contactUnlock,
      },
      {
        id: 'aiMatch',
        label: 'AI 智能匹配',
        current: current.aiMatch,
        target: target.aiMatch,
      },
      {
        id: 'map',
        label: '地图实时定位',
        current: current.map,
        target: target.map,
      },
    ],
  };
}
