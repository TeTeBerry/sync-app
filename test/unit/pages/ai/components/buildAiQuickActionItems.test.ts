import { describe, expect, it } from 'vitest';
import { buildAiQuickActionItems } from '@/pages/ai/components/buildAiQuickActionItems';
import { buildFestivalPlanChecklist } from '@/domains/festival-plan/buildFestivalPlanChecklist';
import { getFestivalPlanTaskDefs } from '@/domains/festival-plan/festivalPlanTaskLabels';
import { t } from '@/i18n';

describe('buildAiQuickActionItems', () => {
  it('builds lineup, schedule, and plan task actions', () => {
    const checklist = buildFestivalPlanChecklist({
      hasTravelGuide: false,
      hasItinerary: false,
      hasBuddyPost: false,
    });
    const defs = getFestivalPlanTaskDefs();
    const pressed: string[] = [];

    const items = buildAiQuickActionItems({
      checklist,
      onLineupPress: () => pressed.push('lineup'),
      onSchedulePress: () => pressed.push('schedule'),
      onTaskPress: (task) => pressed.push(task.key),
    });

    expect(items.map((item) => item.label)).toEqual([
      t('ai.lineup'),
      t('ai.schedule'),
      defs.travel_guide.actionLabel,
      defs.itinerary.actionLabel,
      defs.buddy_post.actionLabel,
    ]);
    expect(items.find((item) => item.key === 'travel_guide')?.isNext).toBe(true);

    items[0]?.onPress();
    items[2]?.onPress();
    expect(pressed).toEqual(['lineup', 'travel_guide']);
  });
});
