import type { AiBuddyPostFormValues } from '../types/buddyPost';
import type { AiGuidePlanFormValues } from '../types/travelGuide';

export type EventDetailTravelGuideNavIntent = {
  activityLegacyId: number;
  prefillTravelGuideForm: AiGuidePlanFormValues;
  /** 重新生成时沿用原攻略 ID，更新而非新建 */
  regenerateGuideId?: string;
};

export type ExclusiveItineraryNavIntent = {
  activityLegacyId: number;
  selectedDjIds: string[];
  selectedDjNames: string[];
  focusDjName?: string;
};

export type EventDetailBuddyPostNavIntent = {
  activityLegacyId: number;
  initialValues: AiBuddyPostFormValues;
  prefillSummaryLines?: string[];
  prefillBannerTitle?: string;
};

export type EventDetailSearchPrefillNavIntent = {
  activityLegacyId: number;
  searchQuery: string;
};
