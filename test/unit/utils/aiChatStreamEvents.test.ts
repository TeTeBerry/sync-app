import { describe, expect, it } from 'vitest';
import type { AiChatStreamEvent } from '@/types/aiChat';
import { parseStreamEventPayload } from '@/utils/aiChatStreamEvents';

describe('aiChatStreamEvents travel_guide_ready', () => {
  it('parses travel_guide_ready stream frame', () => {
    const json = {
      type: 'travel_guide_ready',
      guideId: 'g-1',
      plan: { activityName: 'EDC Thailand' },
      form: {
        departure: '上海',
        headcount: 2,
        budgetTier: 'standard',
        selfDrive: false,
        accommodationNights: 2,
      },
    };

    const event = parseStreamEventPayload(json);
    expect(event).toEqual({
      type: 'travel_guide_ready',
      guideId: 'g-1',
      plan: { activityName: 'EDC Thailand' },
      form: {
        departure: '上海',
        headcount: 2,
        budgetTier: 'standard',
        selfDrive: false,
        accommodationNights: 2,
      },
    } satisfies AiChatStreamEvent);
  });
});
