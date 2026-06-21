import { useCallback } from 'react';
import type {
  FestivalPlanChecklist,
  FestivalPlanTask,
} from './buildFestivalPlanChecklist';
import type { FestivalPlanTaskActions } from './festivalPlanTaskActions';
import { handleFestivalPlanTaskPress } from './festivalPlanNavigation.util';

export function useFestivalPlanNavigation(
  activityLegacyId?: number,
  checklist?: FestivalPlanChecklist | null,
  actions?: FestivalPlanTaskActions | null,
) {
  return useCallback(
    (task: FestivalPlanTask) => {
      handleFestivalPlanTaskPress(task, {
        activityLegacyId,
        checklist,
        actions,
      });
    },
    [actions, activityLegacyId, checklist],
  );
}
