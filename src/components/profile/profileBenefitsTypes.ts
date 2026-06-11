import type { PackageTierId } from '../../types/backend';

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
  contactUnlock: ProfileFreeBenefitQuota;
  upsellText: string;
};

export type ProfileBenefitMetricKind = 'contact' | 'duration';

export type ProfileBenefitMetric = {
  id: string;
  kind: ProfileBenefitMetricKind;
  value: number;
  unit: string;
  label: string;
  /** Remaining quota ratio (0–1), drives progress bar fill. */
  remainingRatio: number;
  lowRemaining: boolean;
};

export type ProfileBenefits = {
  planLabel: string;
  upgradeLabel: string;
  promo: {
    prefix: string;
    highlight: string;
    suffix: string;
  };
  metrics: ProfileBenefitMetric[];
};
