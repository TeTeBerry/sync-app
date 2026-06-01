import Taro from '@tarojs/taro';
import type { EventPackageEntitlement, FreeMonthlyQuota } from '../../types/backend';
import {
  buildMockPaidEntitlement,
  buildMockProPlusEntitlement,
} from './profileBenefitsMapper';

/** Dev-only: override profile paid cards + global free monthly. Set `TARO_APP_DEBUG_ENTITLEMENTS=true` or use in development. */
export type ProfileDebugEntitlementPreset =
  | 'api'
  | 'free_only'
  | 'pro_single'
  | 'pro_plus_single'
  | 'ultra_single'
  | 'dual_cards';

export const PROFILE_DEBUG_ENTITLEMENT_STORAGE_KEY =
  'sync.profile.debugEntitlementPreset';

export const PROFILE_DEBUG_ENTITLEMENT_LABELS: Record<
  ProfileDebugEntitlementPreset,
  string
> = {
  api: 'API 真实数据',
  free_only: '纯免费',
  pro_single: 'Pro 单场',
  pro_plus_single: 'Pro+ 单场',
  ultra_single: 'Ultra 单场',
  dual_cards: '双卡 Pro+Pro+',
};

const PRESET_ORDER: ProfileDebugEntitlementPreset[] = [
  'api',
  'free_only',
  'pro_single',
  'pro_plus_single',
  'ultra_single',
  'dual_cards',
];

export function isProfileDebugEntitlementsEnabled(): boolean {
  return (
    process.env.NODE_ENV === 'development' ||
    process.env.TARO_APP_DEBUG_ENTITLEMENTS === 'true'
  );
}

function defaultFreeMonthly(): FreeMonthlyQuota {
  return {
    period: '2026-05',
    aiMatch: { limit: 3, used: 0, remaining: 3 },
    contactUnlock: { limit: 3, used: 1, remaining: 2 },
  };
}

function buildMockUltraEntitlement(): EventPackageEntitlement {
  return {
    activityLegacyId: 1,
    tierId: 'ultra',
    tierName: 'Ultra',
    paidTierId: 'ultra',
    purchasedAt: new Date().toISOString(),
    quotas: {
      aiMatch: { limit: null, used: 5, remaining: null },
      contactUnlock: { limit: null, used: 0, remaining: null },
      map: {
        days: 30,
        expiresAt: new Date(Date.now() + 20 * 86_400_000).toISOString(),
        active: true,
      },
      postPin: { limit: 2, used: 1, remaining: 1 },
      basicExposure: false,
    },
  };
}

export type ProfileDebugEntitlementOverride = {
  paid: EventPackageEntitlement[];
  freeMonthly: FreeMonthlyQuota | null;
};

export function resolveProfileDebugEntitlements(
  preset: ProfileDebugEntitlementPreset,
): ProfileDebugEntitlementOverride | null {
  if (preset === 'api') {
    return null;
  }

  const freeMonthly = defaultFreeMonthly();

  switch (preset) {
    case 'free_only':
      return { paid: [], freeMonthly };
    case 'pro_single':
      return { paid: [buildMockPaidEntitlement()], freeMonthly };
    case 'pro_plus_single':
      return { paid: [buildMockProPlusEntitlement()], freeMonthly };
    case 'ultra_single':
      return { paid: [buildMockUltraEntitlement()], freeMonthly };
    case 'dual_cards':
      return {
        paid: [buildMockPaidEntitlement(), buildMockProPlusEntitlement()],
        freeMonthly,
      };
    default:
      return null;
  }
}

export function readProfileDebugEntitlementPreset(): ProfileDebugEntitlementPreset {
  if (!isProfileDebugEntitlementsEnabled()) {
    return 'api';
  }
  try {
    const stored = Taro.getStorageSync(PROFILE_DEBUG_ENTITLEMENT_STORAGE_KEY);
    if (typeof stored === 'string' && stored in PROFILE_DEBUG_ENTITLEMENT_LABELS) {
      return stored as ProfileDebugEntitlementPreset;
    }
  } catch {
    // ignore
  }
  return 'api';
}

export function persistProfileDebugEntitlementPreset(
  preset: ProfileDebugEntitlementPreset,
): void {
  try {
    Taro.setStorageSync(PROFILE_DEBUG_ENTITLEMENT_STORAGE_KEY, preset);
  } catch {
    // ignore
  }
}

export function cycleProfileDebugEntitlementPreset(
  current: ProfileDebugEntitlementPreset,
): ProfileDebugEntitlementPreset {
  const index = PRESET_ORDER.indexOf(current);
  const next = PRESET_ORDER[(index + 1) % PRESET_ORDER.length];
  persistProfileDebugEntitlementPreset(next);
  return next;
}

export function profileDebugEntitlementActionSheetItems(): string[] {
  return PRESET_ORDER.map((key) => PROFILE_DEBUG_ENTITLEMENT_LABELS[key]);
}

export function profileDebugPresetFromActionSheetIndex(
  index: number,
): ProfileDebugEntitlementPreset {
  return PRESET_ORDER[index] ?? 'api';
}
