import { getBuddyPostSheetActionLabel } from '@/utils/buddyPostPromptMessage';
import { getItinerarySheetActionLabel } from '@/utils/itineraryPromptMessage';
import { getTravelGuideSheetActionLabel } from '@/utils/travelGuidePromptMessage';
import { labelMatchesKey } from '@/i18n';
import type { WelcomeCapabilityChipAction } from '@/utils/aiAssistantCapabilityDiscovery';
import type { FestivalPlanTaskKey } from '@/domains/festival-plan/festivalPlanTaskDefs';
import type { AiCapability } from './types';

export function capabilityFromWelcomeChipAction(
  action: WelcomeCapabilityChipAction,
): AiCapability | null {
  switch (action.type) {
    case 'travel_guide_sheet':
      return 'travel_guide';
    case 'itinerary_sheet':
      return 'itinerary';
    case 'buddy_post_sheet':
      return 'buddy_post';
    default:
      return null;
  }
}

export function capabilityFromSuggestedReplyLabel(label: string): AiCapability | null {
  const trimmed = label.trim();
  if (!trimmed) return null;

  if (labelMatchesKey(trimmed, 'ai.generateTravelGuide')) {
    return 'travel_guide';
  }
  if (labelMatchesKey(trimmed, 'ai.generateItinerary')) {
    return 'itinerary';
  }
  if (labelMatchesKey(trimmed, 'ai.buddyPost')) {
    return 'buddy_post';
  }

  // Backend may still send Chinese sheet labels
  if (trimmed === getTravelGuideSheetActionLabel()) {
    return 'travel_guide';
  }
  if (trimmed === getItinerarySheetActionLabel()) {
    return 'itinerary';
  }
  if (trimmed === getBuddyPostSheetActionLabel()) {
    return 'buddy_post';
  }

  return null;
}

export function capabilityFromFestivalPlanTaskKey(
  key: FestivalPlanTaskKey,
): AiCapability | null {
  switch (key) {
    case 'travel_guide':
      return 'travel_guide';
    case 'itinerary':
      return 'itinerary';
    case 'buddy_post':
      return 'buddy_post';
  }
}
