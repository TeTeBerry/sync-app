import { describe, expect, it } from 'vitest';
import {
  buildWelcomeCapabilityChipLabels,
  createWelcomeChatMessage,
  festivalPlanTaskKeyFromActionLabel,
  resolveWelcomeCapabilityChipAction,
} from '@/utils/aiAssistantCapabilityDiscovery';
import {
  getBuddyPostCta,
  getGenerateItineraryCta,
  getGenerateTravelGuideCta,
} from '@/constants/aiCtaLabels';
import { getFestivalPlanTaskDefs } from '@/domains/festival-plan/festivalPlanTaskLabels';
import { t } from '@/i18n';

describe('aiAssistantCapabilityDiscovery', () => {
  it('shows bound chips with next task and lineup', () => {
    const defs = getFestivalPlanTaskDefs();
    expect(buildWelcomeCapabilityChipLabels(true, 'travel_guide')).toEqual([
      defs.travel_guide.actionLabel,
      t('ai.lineup'),
    ]);
  });

  it('shows bound lineup chip only when plan is complete', () => {
    expect(buildWelcomeCapabilityChipLabels(true)).toEqual([t('ai.lineup')]);
  });

  it('shows unbound discovery chips without personality test', () => {
    expect(buildWelcomeCapabilityChipLabels(false)).toEqual([
      t('ai.pickFestival'),
      t('ai.nearEvents'),
    ]);
  });

  it('creates welcome message with capability chips', () => {
    const defs = getFestivalPlanTaskDefs();
    const message = createWelcomeChatMessage('EDC Thailand 2026', 8, 'travel_guide');
    expect(message.isWelcome).toBe(true);
    expect(message.text).toContain('EDC Thailand 2026');
    expect(message.suggestedReplies).toEqual([
      defs.travel_guide.actionLabel,
      t('ai.lineup'),
    ]);
  });

  it('maps festival plan action labels to task keys', () => {
    const defs = getFestivalPlanTaskDefs();
    expect(festivalPlanTaskKeyFromActionLabel(defs.travel_guide.actionLabel)).toBe(
      'travel_guide',
    );
    expect(festivalPlanTaskKeyFromActionLabel(defs.itinerary.actionLabel)).toBe(
      'itinerary',
    );
    expect(festivalPlanTaskKeyFromActionLabel(defs.buddy_post.actionLabel)).toBe(
      'buddy_post',
    );
  });

  it('maps bound chip labels to actions', () => {
    expect(resolveWelcomeCapabilityChipAction(t('ai.lineup'), true)).toEqual({
      type: 'lineup_page',
    });
    expect(resolveWelcomeCapabilityChipAction(t('ai.schedule'), true)).toEqual({
      type: 'schedule_page',
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
    expect(
      resolveWelcomeCapabilityChipAction(
        getFestivalPlanTaskDefs().travel_guide.actionLabel,
        true,
      ),
    ).toEqual({
      type: 'travel_guide_sheet',
    });
  });

  it('maps unbound chip labels to actions', () => {
    expect(resolveWelcomeCapabilityChipAction(t('ai.nearEvents'), false)).toEqual({
      type: 'send',
      text: t('ai.nearEventsSubmit'),
    });
    expect(resolveWelcomeCapabilityChipAction(t('ai.pickFestival'), false)).toEqual({
      type: 'pick_festival_sheet',
    });
  });
});
