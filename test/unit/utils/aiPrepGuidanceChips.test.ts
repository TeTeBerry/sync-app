import { describe, expect, it } from 'vitest';
import {
  buildPrepGuidanceChipLabels,
  shouldAttachPrepGuidanceChips,
  withPrepGuidanceChips,
} from '@/utils/aiPrepGuidanceChips';
import { t } from '@/i18n';

describe('aiPrepGuidanceChips', () => {
  it('builds no bound prep chips when activity is bound', () => {
    expect(buildPrepGuidanceChipLabels(8, 'itinerary')).toEqual([]);
  });

  it('builds no bound prep chips when plan is complete', () => {
    expect(buildPrepGuidanceChipLabels(8)).toEqual([]);
  });

  it('builds unbound prep chips when no activity', () => {
    expect(buildPrepGuidanceChipLabels(undefined)).toEqual([t('ai.nearEvents')]);
  });

  it('does not attach bound prep chips when plan bar covers tasks', () => {
    const next = withPrepGuidanceChips(
      { id: '1', from: 'ai', text: 'Techno 是一种…', isPrepGuidance: true },
      8,
      'travel_guide',
    );
    expect(next.suggestedReplies).toBeUndefined();
  });

  it('skips attach when suggested replies already exist', () => {
    expect(
      shouldAttachPrepGuidanceChips({
        id: '1',
        from: 'ai',
        text: 'reply',
        isPrepGuidance: true,
        suggestedReplies: ['查阵容'],
      }),
    ).toBe(false);
  });

  it('skips attach when message has travel guide embed', () => {
    expect(
      shouldAttachPrepGuidanceChips({
        id: '1',
        from: 'ai',
        text: 'reply',
        isPrepGuidance: true,
        travelGuide: {
          guideId: 'g1',
          plan: {} as never,
          form: {} as never,
        },
      }),
    ).toBe(false);
  });
});
