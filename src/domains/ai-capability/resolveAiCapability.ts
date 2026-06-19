import { BUDDY_POST_SHEET_ACTION_LABEL } from '@/utils/buddyPostPromptMessage';
import { ITINERARY_SHEET_ACTION_LABEL } from '@/utils/itineraryPromptMessage';
import { TRAVEL_GUIDE_SHEET_ACTION_LABEL } from '@/utils/travelGuidePromptMessage';
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

  if (trimmed === TRAVEL_GUIDE_SHEET_ACTION_LABEL) {
    return 'travel_guide';
  }
  if (trimmed === ITINERARY_SHEET_ACTION_LABEL) {
    return 'itinerary';
  }
  if (trimmed === BUDDY_POST_SHEET_ACTION_LABEL) {
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
