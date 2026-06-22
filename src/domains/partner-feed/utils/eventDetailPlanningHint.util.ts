import type { FestivalPlanChecklist } from '@/domains/festival-plan/buildFestivalPlanChecklist';

export function resolvePrepCollapsedHint({
  showFestivalPlan,
  checklist,
  t,
}: {
  showFestivalPlan: boolean;
  checklist?: FestivalPlanChecklist | null;
  t: (key: string, params?: Record<string, string>) => string;
}): string {
  if (showFestivalPlan && checklist?.nextTaskKey) {
    const nextTask = checklist.tasks.find((task) => task.key === checklist.nextTaskKey);
    if (nextTask) {
      return t('festivalPlan.nextStep', {
        label: nextTask.done ? nextTask.label : nextTask.title,
      });
    }
  }
  return showFestivalPlan
    ? t('eventDetail.festivalPrepHint')
    : t('eventDetail.festivalPrepHintGuest');
}
