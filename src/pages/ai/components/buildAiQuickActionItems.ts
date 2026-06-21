import { t } from '@/i18n';
import {
  FESTIVAL_PLAN_TASK_ORDER,
  type FestivalPlanTaskKey,
} from '@/domains/festival-plan/festivalPlanTaskDefs';
import type {
  FestivalPlanChecklist,
  FestivalPlanTask,
} from '@/domains/festival-plan/buildFestivalPlanChecklist';

export type AiQuickActionItem = {
  key: string;
  label: string;
  isNext: boolean;
  onPress: () => void;
};

function findPlanTask(
  checklist: FestivalPlanChecklist,
  key: FestivalPlanTaskKey,
): FestivalPlanTask | undefined {
  return checklist.tasks.find((task) => task.key === key);
}

export function buildAiQuickActionItems(options: {
  checklist: FestivalPlanChecklist;
  onLineupPress: () => void;
  onSchedulePress: () => void;
  onTaskPress: (task: FestivalPlanTask) => void;
}): AiQuickActionItem[] {
  const { checklist, onLineupPress, onSchedulePress, onTaskPress } = options;

  const items: AiQuickActionItem[] = [
    {
      key: 'lineup',
      label: t('ai.lineup'),
      isNext: false,
      onPress: onLineupPress,
    },
    {
      key: 'schedule',
      label: t('ai.schedule'),
      isNext: false,
      onPress: onSchedulePress,
    },
  ];

  for (const key of FESTIVAL_PLAN_TASK_ORDER) {
    const task = findPlanTask(checklist, key);
    if (!task) continue;
    items.push({
      key,
      label: task.trailingLabel,
      isNext: task.isNext,
      onPress: () => onTaskPress(task),
    });
  }

  return items;
}
