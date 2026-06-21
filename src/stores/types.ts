import type { AiBuddyPostFormValues } from '../types/buddyPost';
import type { AiGuidePlanFormValues } from '../types/travelGuide';

export type EventDetailTravelGuideNavIntent = {
  activityLegacyId: number;
  prefillTravelGuideForm: AiGuidePlanFormValues;
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
