export type AiCapability = 'travel_guide' | 'itinerary' | 'buddy_post';

export type CapabilitySource = 'chat' | 'festival_plan' | 'sheet' | 'deep_link';

export type RunCapabilityOptions = {
  source?: CapabilitySource;
};

export type CapabilityHandlers = {
  openTravelGuideSheet: () => void;
  openItinerary: () => void;
  openBuddyPostSheet: () => void;
};
