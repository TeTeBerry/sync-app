import type { AiGuidePlanFormValues } from '../types/travelGuide';

export type AiAssistantNavIntent = {
  initialMessage?: string;
  activityLegacyId?: number;
  /** Open AI travel-guide plan sheet after entering the assistant. */
  openAiGuideSheet?: boolean;
  /** Run travel-guide generation after chat mounts (from event-detail sheet submit). */
  autoRunTravelGuideForm?: AiGuidePlanFormValues;
};

export type ProfileNavIntent = {
  /** Open the profile package upgrade sheet after switching to the profile tab. */
  openPackageSheet?: boolean;
};
