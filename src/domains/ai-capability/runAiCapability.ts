import type { AiCapability, CapabilityHandlers, RunCapabilityOptions } from './types';

export function runAiCapability(
  capability: AiCapability,
  handlers: CapabilityHandlers,
  _options?: RunCapabilityOptions,
): void {
  switch (capability) {
    case 'travel_guide':
      handlers.openTravelGuideSheet();
      break;
    case 'itinerary':
      handlers.openItinerary();
      break;
    case 'buddy_post':
      handlers.openBuddyPostSheet();
      break;
  }
}
