import type { AiBuddyPostFormValues } from '../types/buddyPost';
import type { AiGuidePlanFormValues } from '../types/travelGuide';

export type AiAssistantNavIntent = {
  initialMessage?: string;
  activityLegacyId?: number;
  /** Open AI travel-guide plan sheet after entering the assistant. */
  openAiGuideSheet?: boolean;
  /** Open exclusive-itinerary / itinerary flow after entering the assistant. */
  openItinerarySheet?: boolean;
  /** Open buddy-post sheet after entering the assistant. */
  openBuddyPostSheet?: boolean;
  /** Prefill the travel-guide sheet (e.g. regenerate) without auto-submitting. */
  prefillTravelGuideForm?: AiGuidePlanFormValues;
  /** Run travel-guide generation after chat mounts (from event-detail sheet submit). */
  autoRunTravelGuideForm?: AiGuidePlanFormValues;
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
