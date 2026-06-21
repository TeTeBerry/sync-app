import { describe, expect, it, vi } from 'vitest';
import { createFestivalPlanTaskActions } from '@/domains/festival-plan/festivalPlanRouteHandlers';
import { runAiCapability } from '@/domains/ai-capability/runAiCapability';

vi.mock('@/domains/ai-capability/runAiCapability', () => ({
  runAiCapability: vi.fn(),
}));

describe('createFestivalPlanTaskActions', () => {
  it('delegates capabilities to injected handlers', () => {
    const openTravelGuideSheet = vi.fn();
    const openItinerary = vi.fn();
    const openBuddyPostSheet = vi.fn();

    const actions = createFestivalPlanTaskActions({
      openTravelGuideSheet,
      openItinerary,
      openBuddyPostSheet,
    });

    actions.runCapability('travel_guide');
    actions.runCapability('itinerary');
    actions.runCapability('buddy_post');
    actions.openBuddyPostSheet();

    expect(runAiCapability).toHaveBeenNthCalledWith(
      1,
      'travel_guide',
      expect.objectContaining({ openTravelGuideSheet }),
    );
    expect(runAiCapability).toHaveBeenNthCalledWith(
      2,
      'itinerary',
      expect.objectContaining({ openItinerary }),
    );
    expect(runAiCapability).toHaveBeenNthCalledWith(
      3,
      'buddy_post',
      expect.objectContaining({ openBuddyPostSheet }),
    );
    expect(openBuddyPostSheet).toHaveBeenCalledTimes(1);
  });
});
