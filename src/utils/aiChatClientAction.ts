import type { ClientAction } from '@sync/chat-contracts';

export function applyClientActionToMessage(
  message: {
    showBuddyPostSheetCta?: boolean;
    showTravelGuideSheetCta?: boolean;
    showItinerarySheetCta?: boolean;
    showPersonalityTestSheetCta?: boolean;
  },
  action: ClientAction,
): {
  showBuddyPostSheetCta?: boolean;
  showTravelGuideSheetCta?: boolean;
  showItinerarySheetCta?: boolean;
  showPersonalityTestSheetCta?: boolean;
} {
  if (action.kind !== 'open_sheet' || action.mode === 'open') {
    return message;
  }

  if (action.sheet === 'buddy_post') {
    return { ...message, showBuddyPostSheetCta: true };
  }

  if (action.sheet === 'travel_guide') {
    return { ...message, showTravelGuideSheetCta: true };
  }

  if (action.sheet === 'itinerary') {
    return { ...message, showItinerarySheetCta: true };
  }

  if (action.sheet === 'personality_test') {
    return { ...message, showPersonalityTestSheetCta: true };
  }

  return message;
}
