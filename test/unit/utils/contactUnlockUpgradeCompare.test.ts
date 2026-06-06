import { describe, expect, it } from 'vitest';
import { MOCK_PACKAGE_CATALOG } from '@/components/profile/profilePackageData';
import {
  buildContactUnlockUpgradeCompare,
  resolveContactUnlockUpgradeTargetTier,
} from '@/utils/contactUnlockUpgradeCompare';

describe('resolveContactUnlockUpgradeTargetTier', () => {
  it('recommends Pro when user has no paid tier', () => {
    expect(resolveContactUnlockUpgradeTargetTier(null)).toBe('pro');
    expect(resolveContactUnlockUpgradeTargetTier(undefined)).toBe('pro');
  });

  it('recommends Pro+ when user is on Pro', () => {
    expect(resolveContactUnlockUpgradeTargetTier('pro')).toBe('pro_plus');
  });

  it('recommends Ultra when user is on Pro+', () => {
    expect(resolveContactUnlockUpgradeTargetTier('pro_plus')).toBe('ultra');
  });

  it('returns null at Ultra', () => {
    expect(resolveContactUnlockUpgradeTargetTier('ultra')).toBeNull();
  });
});

describe('buildContactUnlockUpgradeCompare', () => {
  const tiers = MOCK_PACKAGE_CATALOG.tiers;

  it('shows free monthly limits vs Pro for free users', () => {
    const model = buildContactUnlockUpgradeCompare({
      tiers,
      currentPaidTierId: null,
      targetTierId: 'pro',
    });
    expect(model?.targetTierName).toBe('Pro');
    expect(model?.rows[0]).toEqual({
      id: 'contactUnlock',
      label: '联系方式解锁',
      current: '3次/月',
      target: '5次/场',
    });
    expect(model?.rows[1]).toEqual({
      id: 'aiMatch',
      label: 'AI 智能匹配',
      current: '3次/月',
      target: '8次/场',
    });
    expect(model?.rows[2]).toEqual({
      id: 'map',
      label: '地图实时定位',
      current: '限量',
      target: '7天',
    });
  });

  it('shows Pro vs Pro+ limits for Pro users', () => {
    const model = buildContactUnlockUpgradeCompare({
      tiers,
      currentPaidTierId: 'pro',
      targetTierId: 'pro_plus',
    });
    expect(model?.targetTierName).toBe('Pro+');
    expect(model?.rows[0]).toEqual({
      id: 'contactUnlock',
      label: '联系方式解锁',
      current: '5次/场',
      target: '12次/场',
    });
    expect(model?.rows[1].current).toBe('8次/场');
    expect(model?.rows[1].target).toBe('15次/场');
    expect(model?.rows[2].current).toBe('7天');
    expect(model?.rows[2].target).toBe('15天');
  });

  it('uses API free monthly limits when provided', () => {
    const model = buildContactUnlockUpgradeCompare({
      tiers,
      currentPaidTierId: null,
      targetTierId: 'pro',
      freeMonthly: {
        period: '2026-05',
        aiMatch: { limit: 3, used: 3, remaining: 0 },
        contactUnlock: { limit: 3, used: 3, remaining: 0 },
      },
    });
    expect(model?.rows[0].current).toBe('3次/月');
  });
});
