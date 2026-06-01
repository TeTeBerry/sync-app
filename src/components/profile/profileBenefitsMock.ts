import type { EventPackageEntitlement } from '../../types/backend';
import type { ProfileBenefits } from './mockData';
import { MOCK_PACKAGE_CATALOG } from './profilePackageData';
import {
  FREE_MONTHLY_AI_LIMIT,
  FREE_MONTHLY_CONTACT_LIMIT,
  MOCK_PROFILE_SEED_ACTIVITY_LEGACY_ID,
} from './profileEntitlementMapper';

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
