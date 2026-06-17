import { describe, expect, it } from 'vitest';
import { applyClientActionToMessage } from '@/utils/aiChatClientAction';

describe('aiChatClientAction', () => {
  it('maps open_sheet prompt actions to message CTAs', () => {
    expect(
      applyClientActionToMessage(
        {},
        { kind: 'open_sheet', sheet: 'buddy_post', mode: 'prompt' },
      ),
    ).toEqual({ showBuddyPostSheetCta: true });

    expect(
      applyClientActionToMessage(
        {},
        { kind: 'open_sheet', sheet: 'travel_guide', mode: 'prompt' },
      ),
    ).toEqual({ showTravelGuideSheetCta: true });

    expect(
      applyClientActionToMessage(
        {},
        { kind: 'open_sheet', sheet: 'itinerary', mode: 'prompt' },
      ),
    ).toEqual({ showItinerarySheetCta: true });

    expect(
      applyClientActionToMessage(
        {},
        { kind: 'open_sheet', sheet: 'personality_test', mode: 'prompt' },
      ),
    ).toEqual({ showPersonalityTestSheetCta: true });
  });
});
