import { describe, expect, it } from 'vitest';
import { mergeFestivalPlanProgressInput } from '@/domains/festival-plan/mergeFestivalPlanProgressInput';

describe('mergeFestivalPlanProgressInput', () => {
  it('prefers local travel guide and buddy post over server', () => {
    const merged = mergeFestivalPlanProgressInput(
      {
        activityLegacyId: 4,
        hasTravelGuide: true,
        travelGuideId: 'server-guide',
        hasItinerary: false,
        hasBuddyPost: false,
        isRegistered: false,
      },
      {
        travelGuideId: 'local-guide',
        buddyPostId: 'chat-post',
        isRegistered: true,
      },
    );

    expect(merged).toEqual({
      hasTravelGuide: true,
      travelGuideId: 'local-guide',
      hasItinerary: false,
      itineraryDayCount: undefined,
      itinerarySelectedDjIds: undefined,
      hasBuddyPost: true,
      buddyPostId: 'chat-post',
      isRegistered: true,
    });
  });

  it('falls back to server itinerary when local is empty', () => {
    const merged = mergeFestivalPlanProgressInput(
      {
        activityLegacyId: 4,
        hasTravelGuide: false,
        hasItinerary: true,
        itineraryDayCount: 2,
        itinerarySelectedDjIds: ['dj-1'],
        hasBuddyPost: true,
        buddyPostId: 'post-1',
        isRegistered: true,
      },
      {},
    );

    expect(merged.hasItinerary).toBe(true);
    expect(merged.itineraryDayCount).toBe(2);
    expect(merged.buddyPostId).toBe('post-1');
    expect(merged.isRegistered).toBe(true);
  });
});
