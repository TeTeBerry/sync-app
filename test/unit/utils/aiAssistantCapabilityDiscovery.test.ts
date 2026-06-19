import { describe, expect, it } from 'vitest';
import {
  buildWelcomeCapabilityChipLabels,
  createWelcomeChatMessage,
  resolveWelcomeCapabilityChipAction,
} from '@/utils/aiAssistantCapabilityDiscovery';
import {
  getBuddyPostCta,
  getGenerateItineraryCta,
  getGenerateTravelGuideCta,
  getStartPersonalityTestCta,
} from '@/constants/aiCtaLabels';
import { t } from '@/i18n';

describe('aiAssistantCapabilityDiscovery', () => {
  it('shows bound lineup chip only — plan tasks live in festival checklist', () => {
    expect(buildWelcomeCapabilityChipLabels(true)).toEqual([t('ai.lineup')]);
  });

  it('shows unbound discovery chips', () => {
    expect(buildWelcomeCapabilityChipLabels(false)).toEqual([
      t('ai.pickFestival'),
      t('ai.nearEvents'),
      getStartPersonalityTestCta(),
    ]);
  });

  it('creates welcome message with capability chips', () => {
    const message = createWelcomeChatMessage('EDC Thailand 2026', 8);
    expect(message.isWelcome).toBe(true);
    expect(message.text).toContain('EDC Thailand 2026');
    expect(message.suggestedReplies).toEqual([t('ai.lineup')]);
  });

  it('maps bound chip labels to actions', () => {
    expect(resolveWelcomeCapabilityChipAction(t('ai.lineup'), true)).toEqual({
      type: 'send',
      text: t('ai.lineup'),
    });
    expect(
      resolveWelcomeCapabilityChipAction(getGenerateTravelGuideCta(), true),
    ).toEqual({
      type: 'travel_guide_sheet',
    });
    expect(resolveWelcomeCapabilityChipAction(getGenerateItineraryCta(), true)).toEqual(
      {
        type: 'itinerary_sheet',
      },
    );
    expect(resolveWelcomeCapabilityChipAction(getBuddyPostCta(), true)).toEqual({
      type: 'buddy_post_sheet',
    });
  });

  it('maps unbound chip labels to actions', () => {
    expect(resolveWelcomeCapabilityChipAction(t('ai.nearEvents'), false)).toEqual({
      type: 'send',
      text: t('ai.nearEventsSubmit'),
    });
    expect(
      resolveWelcomeCapabilityChipAction(getStartPersonalityTestCta(), false),
    ).toEqual({
      type: 'personality_test',
    });
    expect(resolveWelcomeCapabilityChipAction(t('ai.pickFestival'), false)).toEqual({
      type: 'pick_festival_sheet',
    });
  });
});
