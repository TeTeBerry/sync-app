import type { FestivalPlanTask } from './buildFestivalPlanChecklist';
import type { FestivalPlanTaskKey } from './festivalPlanTaskDefs';

export function resolveFestivalPlanVisibleTasks(
  tasks: FestivalPlanTask[],
  options: { expanded: boolean; nextTaskKey?: FestivalPlanTaskKey },
): FestivalPlanTask[] {
  if (options.expanded) return tasks;
  if (!options.nextTaskKey) return [];
  return tasks.filter((task) => task.key === options.nextTaskKey);
}
