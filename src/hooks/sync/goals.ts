import { useCallback } from 'react';
import {
  createUserGoal,
  deleteUserGoal,
  fetchUserGoals,
  type CreateUserGoalPayload,
  type UserGoal,
} from '../../api/sync/goals';
import { isLiveApi } from '../../constants/api';
import { isLoggedIn } from '../../utils/authStorage';
import { invalidateCache, useApiQuery } from '../useApiQuery';
import type { QueryEnableOptions } from './types';

const GOALS_QUERY_KEY = ['goals'] as (string | number)[];

export function useUserGoalsQuery(
  activityLegacyId?: number,
  options?: QueryEnableOptions,
) {
  const tabEnabled = options?.enabled ?? true;
  const enabled = isLiveApi() && isLoggedIn() && tabEnabled;

  return useApiQuery({
    queryKey:
      activityLegacyId != null
        ? [...GOALS_QUERY_KEY, activityLegacyId]
        : GOALS_QUERY_KEY,
    queryFn: () => fetchUserGoals(activityLegacyId),
    enabled,
  });
}

export async function createUserGoalAndInvalidate(payload: CreateUserGoalPayload) {
  const goal = await createUserGoal(payload);
  invalidateCache(GOALS_QUERY_KEY);
  return goal;
}

export async function deleteUserGoalAndInvalidate(goalId: string) {
  await deleteUserGoal(goalId);
  invalidateCache(GOALS_QUERY_KEY);
}

export function useUserGoalsMutations() {
  const create = useCallback(async (payload: CreateUserGoalPayload) => {
    return createUserGoalAndInvalidate(payload);
  }, []);

  const remove = useCallback(async (goalId: string) => {
    await deleteUserGoalAndInvalidate(goalId);
  }, []);

  const findWatchLineupGoal = useCallback(
    async (activityLegacyId: number): Promise<UserGoal | undefined> => {
      const goals = await fetchUserGoals(activityLegacyId);
      return goals.find((g) => g.kind === 'watch_lineup' && g.status === 'active');
    },
    [],
  );

  return { create, remove, findWatchLineupGoal };
}
