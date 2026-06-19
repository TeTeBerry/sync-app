import { describe, expect, it, vi } from 'vitest';
import { runAiCapability } from '@/domains/ai-capability/runAiCapability';
import {
  capabilityFromFestivalPlanTaskKey,
  capabilityFromSuggestedReplyLabel,
  capabilityFromWelcomeChipAction,
} from '@/domains/ai-capability/resolveAiCapability';
import {
  getBuddyPostCta,
  getGenerateItineraryCta,
  getGenerateTravelGuideCta,
} from '@/constants/aiCtaLabels';

describe('runAiCapability', () => {
  it('dispatches to the matching handler', () => {
    const handlers = {
      openTravelGuideSheet: vi.fn(),
      openItinerary: vi.fn(),
      openBuddyPostSheet: vi.fn(),
    };

    runAiCapability('travel_guide', handlers, { source: 'chat' });
    runAiCapability('itinerary', handlers, { source: 'festival_plan' });
    runAiCapability('buddy_post', handlers, { source: 'sheet' });

    expect(handlers.openTravelGuideSheet).toHaveBeenCalledTimes(1);
    expect(handlers.openItinerary).toHaveBeenCalledTimes(1);
    expect(handlers.openBuddyPostSheet).toHaveBeenCalledTimes(1);
  });
});

describe('resolveAiCapability', () => {
  it('maps welcome chip actions', () => {
    expect(capabilityFromWelcomeChipAction({ type: 'travel_guide_sheet' })).toBe(
      'travel_guide',
    );
    expect(capabilityFromWelcomeChipAction({ type: 'itinerary_sheet' })).toBe(
      'itinerary',
    );
    expect(capabilityFromWelcomeChipAction({ type: 'buddy_post_sheet' })).toBe(
      'buddy_post',
    );
    expect(
      capabilityFromWelcomeChipAction({ type: 'send', text: '查阵容' }),
    ).toBeNull();
  });

  it('maps suggested reply labels', () => {
    expect(capabilityFromSuggestedReplyLabel(getGenerateTravelGuideCta())).toBe(
      'travel_guide',
    );
    expect(capabilityFromSuggestedReplyLabel(getGenerateItineraryCta())).toBe(
      'itinerary',
    );
    expect(capabilityFromSuggestedReplyLabel(getBuddyPostCta())).toBe('buddy_post');
  });

  it('maps festival plan task keys', () => {
    expect(capabilityFromFestivalPlanTaskKey('travel_guide')).toBe('travel_guide');
    expect(capabilityFromFestivalPlanTaskKey('buddy_post')).toBe('buddy_post');
  });
});
