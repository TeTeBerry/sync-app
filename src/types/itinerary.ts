/**
 * Canonical: `sync-app-backend/src/shared/itinerary/index.ts`
 * Do not duplicate shapes here — re-export only.
 */
export type {
  GenerateItineraryPayload,
  GenerateItineraryResult,
  ItineraryBuddyRecruitHint,
  ItineraryConflict,
  ItineraryDay,
  ItineraryDj,
  ItineraryScheduleSnapshot,
  ItineraryStage,
  ItineraryTimelineDotColor,
  ItineraryTimelineItem,
  ItineraryTimelinePill,
  SaveItineraryPayload,
  SaveItineraryResult,
  SavedItineraryResult,
} from '@sync/itinerary-contracts';

export {
  formatClockTime,
  normalizeItineraryDaysForSave,
} from '@sync/itinerary-contracts';
