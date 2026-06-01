import type {
  PackageCatalog,
  PackageTierDefinition,
  PackageTierId,
} from '../../types/backend';

export type { PackageTierId };

/** Paid single-event tier ladder (low → high). */
export const PACKAGE_TIER_ORDER: readonly PackageTierId[] = [
  'pro',
  'pro_plus',
  'ultra',
] as const;

/** Offline / mock-mode catalog when `isApiEnabled()` is false. */
export const MOCK_PACKAGE_CATALOG: PackageCatalog = {
  sheet: {
    title: '单场套餐',
    subtitle: '按场购买，灵活使用，无订阅压力',
    defaultTierId: 'pro',
  },
  tiers: [
    {
      id: 'pro',
      name: 'Pro',
      priceYuan: 6.9,
      priceLabel: '6.9',
      audience: '普通爱好者 · 偶尔组队散户',
      limits: {
        aiMatchCount: 8,
        contactUnlockCount: 5,
        mapDays: 7,
        postPinCount: 0,
        basicExposure: true,
      },
      features: [
        { icon: 'match', text: 'AI 智能匹配 · 8 次' },
        { icon: 'contact', text: '联系方式解锁 · 5 次' },
        { icon: 'map', text: '点位地图 · 7 天' },
        { icon: 'exposure', text: '组队帖基础曝光' },
      ],
    },
    {
      id: 'pro_plus',
      name: 'Pro+',
      priceYuan: 9.9,
      priceLabel: '9.9',
      audience: '组队发起人 · 高频找搭子用户',
      badge: '主推爆款',
      limits: {
        aiMatchCount: 15,
        contactUnlockCount: 12,
        mapDays: 15,
        postPinCount: 1,
        basicExposure: false,
      },
      features: [
        { icon: 'match', text: 'AI 智能匹配 · 15 次' },
        { icon: 'contact', text: '联系方式解锁 · 12 次' },
        { icon: 'map', text: '点位地图 · 15 天' },
        { icon: 'pin', text: '帖子 24h 置顶 × 1 次' },
      ],
    },
    {
      id: 'ultra',
      name: 'Ultra',
      priceYuan: 15.9,
      priceLabel: '15.9',
      audience: '跨城团长 · 电音 KOL · 重度发烧友',
      limits: {
        aiMatchCount: null,
        contactUnlockCount: null,
        mapDays: 30,
        postPinCount: 2,
        basicExposure: false,
      },
      features: [
        { icon: 'match', text: 'AI 智能匹配 · 不限次', unlimited: true },
        { icon: 'contact', text: '联系方式解锁 · 不限次', unlimited: true },
        { icon: 'map', text: '点位地图 · 30 天（上限）' },
        { icon: 'pin', text: '帖子 24h 置顶 × 2 次' },
      ],
    },
  ],
};

export const PACKAGE_SHEET_ACTIVITY_STEP = {
  title: '选择适用活动',
  subtitle: '套餐权益需绑定至单场活动生效',
} as const;

/** Activity already bound (e.g. paid benefit card / upgrade). Skips activity picker step. */
export function isBoundActivityLegacyId(
  value: number | undefined | null,
): value is number {
  return value != null && !Number.isNaN(value);
}

export function packageTierCtaLabel(
  tier: Pick<PackageTierDefinition, 'id' | 'name'>,
): string {
  if (tier.id === 'pro_plus') return `立即开通 ${tier.name}`;
  return `选择 ${tier.name}`;
}

/** Tier step CTA when activity is chosen on a later step (banner purchase). */
export function packageTierNextStepCtaLabel(): string {
  return '下一步：选择适用活动';
}

/** Activity step CTA before an activity is selected. */
export function packageActivitySelectCtaLabel(): string {
  return '请先选择活动';
}

/** Activity step CTA after selection — pay and bind tier to event. */
export function packagePayAndBindCtaLabel(
  tier: Pick<PackageTierDefinition, 'priceLabel'>,
): string {
  return `支付 ¥${tier.priceLabel} 并绑定`;
}

/** CTA when user already owns the selected tier for this activity. */
export function packageTierAlreadyOwnedCtaLabel(
  tier: Pick<PackageTierDefinition, 'name'>,
): string {
  return `您已是 ${tier.name} 套餐`;
}

export type PackageTierCtaState = {
  label: string;
  purchaseDisabled: boolean;
  /** Use neutral grey styling (e.g. activity step with no selection). */
  neutralDisabled?: boolean;
};

/** Pay / bind CTA on activity step (or tier step when activity is pre-known). */
export function resolvePackageActivityPayCta(params: {
  selectedTier: PackageTierDefinition | undefined;
  paidTierId?: PackageTierId | null;
}): PackageTierCtaState {
  const { selectedTier, paidTierId } = params;
  if (!selectedTier) {
    return {
      label: packageActivitySelectCtaLabel(),
      purchaseDisabled: true,
      neutralDisabled: true,
    };
  }
  if (paidTierId != null && selectedTier.id === paidTierId) {
    return {
      label: packageTierAlreadyOwnedCtaLabel(selectedTier),
      purchaseDisabled: true,
    };
  }
  return {
    label: packagePayAndBindCtaLabel(selectedTier),
    purchaseDisabled: false,
  };
}

/** Purchase CTA for package sheet — blocks repeat purchase of the same tier. */
export function resolvePackageTierCta(params: {
  selectedTier: PackageTierDefinition | undefined;
  currentPaidTierId?: PackageTierId | null;
}): PackageTierCtaState {
  const { selectedTier, currentPaidTierId } = params;
  if (!selectedTier) {
    return { label: '选择套餐', purchaseDisabled: false };
  }
  if (currentPaidTierId != null && selectedTier.id === currentPaidTierId) {
    return {
      label: packageTierAlreadyOwnedCtaLabel(selectedTier),
      purchaseDisabled: true,
    };
  }
  return {
    label: packageTierCtaLabel(selectedTier),
    purchaseDisabled: false,
  };
}

/** Tier-step CTA: next to activity picker, or direct pay when activity is pre-known. */
export function resolvePackageTierStepCta(params: {
  selectedTier: PackageTierDefinition | undefined;
  activityPreKnown: boolean;
  currentPaidTierId?: PackageTierId | null;
}): PackageTierCtaState {
  const { selectedTier, activityPreKnown, currentPaidTierId } = params;
  if (activityPreKnown) {
    return resolvePackageActivityPayCta({
      selectedTier,
      paidTierId: currentPaidTierId,
    });
  }
  if (!selectedTier) {
    return { label: packageTierNextStepCtaLabel(), purchaseDisabled: false };
  }
  return { label: packageTierNextStepCtaLabel(), purchaseDisabled: false };
}
