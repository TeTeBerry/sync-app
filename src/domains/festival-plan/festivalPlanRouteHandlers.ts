import { runAiCapability } from '@/domains/ai-capability/runAiCapability';
import type { AiCapability } from '@/domains/ai-capability/types';
import type { FestivalPlanTaskActions } from './festivalPlanTaskActions';

export type FestivalPlanRouteHandlersInput = {
  openTravelGuideSheet: () => void;
  openItinerary: () => void;
  openBuddyPostSheet: () => void;
};

export function createFestivalPlanTaskActions(
  handlers: FestivalPlanRouteHandlersInput,
): FestivalPlanTaskActions {
  return {
    runCapability: (capability: AiCapability) => {
      runAiCapability(capability, handlers);
    },
    openBuddyPostSheet: handlers.openBuddyPostSheet,
  };
}
