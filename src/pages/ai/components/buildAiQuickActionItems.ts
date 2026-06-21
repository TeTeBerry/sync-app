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
}): AiQuickActionItem[] {
  const { onLineupPress, onSchedulePress } = options;

  return [
    {
      key: 'lineup',
      label: t('ai.lineup'),
      onPress: onLineupPress,
    },
    {
      key: 'schedule',
      label: t('ai.schedule'),
      onPress: onSchedulePress,
    },
  ];
}
