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
