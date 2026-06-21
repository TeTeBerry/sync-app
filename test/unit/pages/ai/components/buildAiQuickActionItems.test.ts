import { describe, expect, it } from 'vitest';
import { buildAiQuickActionItems } from '@/pages/ai/components/buildAiQuickActionItems';
import { t } from '@/i18n';

describe('buildAiQuickActionItems', () => {
  it('builds lineup and schedule browse shortcuts only', () => {
    const pressed: string[] = [];

    const items = buildAiQuickActionItems({
      onLineupPress: () => pressed.push('lineup'),
      onSchedulePress: () => pressed.push('schedule'),
    });

    expect(items.map((item) => item.label)).toEqual([t('ai.lineup'), t('ai.schedule')]);

    items[0]?.onPress();
    items[1]?.onPress();
    expect(pressed).toEqual(['lineup', 'schedule']);
  });
});
