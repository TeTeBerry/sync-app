import { describe, expect, it } from 'vitest';
import { buildAiQuickActionItems } from '@/pages/ai/components/buildAiQuickActionItems';
import { t } from '@/i18n';

describe('buildAiQuickActionItems', () => {
  it('shows lineup only before itinerary is generated', () => {
    const pressed: string[] = [];

    const items = buildAiQuickActionItems({
      onLineupPress: () => pressed.push('lineup'),
      onSchedulePress: () => pressed.push('schedule'),
      hasItinerary: false,
    });

    expect(items.map((item) => item.label)).toEqual([t('ai.lineup')]);
    items[0]?.onPress();
    expect(pressed).toEqual(['lineup']);
  });

  it('adds my schedule shortcut after itinerary is generated', () => {
    const pressed: string[] = [];

    const items = buildAiQuickActionItems({
      onLineupPress: () => pressed.push('lineup'),
      onSchedulePress: () => pressed.push('schedule'),
      hasItinerary: true,
    });

    expect(items.map((item) => item.label)).toEqual([
      t('ai.lineup'),
      t('ai.mySchedule'),
    ]);

    items[0]?.onPress();
    items[1]?.onPress();
    expect(pressed).toEqual(['lineup', 'schedule']);
  });
});
