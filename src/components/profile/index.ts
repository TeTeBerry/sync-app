/** Public Profile domain API — prefer importing from here in pages and other packages. */

export { default as ProfileActivitiesSection } from './ProfileActivitiesSection';
export { default as ProfileFreeBenefitsSection } from './ProfileFreeBenefitsSection';
export { default as ProfileGuestSection } from './ProfileGuestSection';
export { default as ProfilePackageSheet } from './ProfilePackageSheet';
export { default as ProfilePaidBenefitsSection } from './ProfilePaidBenefitsSection';
export {
  default as ProfilePostsSection,
  type ProfilePostEditDraft,
} from './ProfilePostsSection';

export { ProfileCollapsibleSection } from './ProfileCollapsibleSection';

export {
  asEntitlementList,
  buildFreeBenefitCardModel,
  getNextTierId,
  isValidFreeMonthlyQuota,
  pickGlobalFreeMonthly,
  type ProfileEventBenefitCardModel,
  type ProfileFreeBenefitCardModel,
} from './profileBenefitsMapper';

export {
  MOCK_PACKAGE_CATALOG,
  packageTierCtaLabel,
  type PackageTierId,
} from './profilePackageData';

export { profileActivities, profilePosts, profileUser } from './mockData';
export { mockNotifications } from './mockNotifications';
export { useProfilePaidBenefitCards } from './useProfilePaidBenefitCards';
export { countOngoingActivities, deriveInterestTag } from './utils';
