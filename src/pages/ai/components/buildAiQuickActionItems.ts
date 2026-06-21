import { t } from '@/i18n';

export type AiQuickActionItem = {
  key: string;
  label: string;
  onPress: () => void;
};

/** Browse-only shortcuts — plan tasks live in FestivalPlanSummaryBar. */
export function buildAiQuickActionItems(options: {
  onLineupPress: () => void;
  onSchedulePress: () => void;
  hasItinerary?: boolean;
}): AiQuickActionItem[] {
  const { onLineupPress, onSchedulePress, hasItinerary = false } = options;

  const items: AiQuickActionItem[] = [
    {
      key: 'lineup',
      label: t('ai.lineup'),
      onPress: onLineupPress,
    },
  ];

  if (hasItinerary) {
    items.push({
      key: 'schedule',
      label: t('ai.mySchedule'),
      onPress: onSchedulePress,
    });
  }

  return items;
}
