import { describe, expect, it } from 'vitest';
import {
  buildWelcomeCapabilityChipLabels,
  createWelcomeChatMessage,
  resolveWelcomeCapabilityChipAction,
} from '@/utils/aiAssistantCapabilityDiscovery';
import {
  BUDDY_POST_CTA,
  GENERATE_ITINERARY_CTA,
  GENERATE_TRAVEL_GUIDE_CTA,
  START_PERSONALITY_TEST_CTA,
} from '@/constants/aiCtaLabels';

describe('aiAssistantCapabilityDiscovery', () => {
  it('shows bound lineup chip only — plan tasks live in festival checklist', () => {
    expect(buildWelcomeCapabilityChipLabels(true)).toEqual(['查阵容']);
  });

  it('shows unbound discovery chips', () => {
    expect(buildWelcomeCapabilityChipLabels(false)).toEqual([
      '选一场电音节',
      '最近有什么活动',
      START_PERSONALITY_TEST_CTA,
    ]);
  });

  it('creates welcome message with capability chips', () => {
    const message = createWelcomeChatMessage('EDC Thailand 2026', 8);
    expect(message.isWelcome).toBe(true);
    expect(message.text).toContain('EDC Thailand 2026');
    expect(message.suggestedReplies).toEqual(['查阵容']);
  });

  it('maps bound chip labels to actions', () => {
    expect(resolveWelcomeCapabilityChipAction('查阵容', true)).toEqual({
      type: 'send',
      text: '查阵容',
    });
    expect(resolveWelcomeCapabilityChipAction(GENERATE_TRAVEL_GUIDE_CTA, true)).toEqual(
      {
        type: 'travel_guide_sheet',
      },
    );
    expect(resolveWelcomeCapabilityChipAction(GENERATE_ITINERARY_CTA, true)).toEqual({
      type: 'itinerary_sheet',
    });
    expect(resolveWelcomeCapabilityChipAction(BUDDY_POST_CTA, true)).toEqual({
      type: 'buddy_post_sheet',
    });
  });

  it('maps unbound chip labels to actions', () => {
    expect(resolveWelcomeCapabilityChipAction('最近有什么活动', false)).toEqual({
      type: 'send',
      text: '查最近活动',
    });
    expect(
      resolveWelcomeCapabilityChipAction(START_PERSONALITY_TEST_CTA, false),
    ).toEqual({
      type: 'personality_test',
    });
    expect(resolveWelcomeCapabilityChipAction('选一场电音节', false)).toEqual({
      type: 'pick_festival_sheet',
    });
  });
});
