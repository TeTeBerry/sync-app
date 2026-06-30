import { create } from 'zustand';
import type { UserGoal } from '../api/sync/goals';
import type { ProfileActivityItem } from '../types/backend';
import { parseActivityLegacyId } from '../utils/activityLegacyId';
import {
  clearActivityUpdateSubscribedLocally,
  isActivityUpdateSubscribedLocally,
  markActivityUpdateSubscribedLocally,
} from '../utils/activityUpdateSubscribeStorage';

export type WatchLineupGoalRef = {
  activityLegacyId: number;
  goalId: string;
};

type ActivitySubscriptionState = {
  registeredLegacyIds: number[];
  watchLineupGoals: WatchLineupGoalRef[];
  hydrated: boolean;
  setFromServer: (activities: ProfileActivityItem[], goals: UserGoal[]) => void;
  applySubscribe: (activityLegacyId: number, goal?: UserGoal) => void;
  applyUnsubscribe: (activityLegacyId: number) => void;
  isRegistered: (activityLegacyId: number) => boolean;
  hasWatchLineup: (activityLegacyId: number) => boolean;
  clear: () => void;
};

function toRegisteredLegacyIds(activities: ProfileActivityItem[]): number[] {
  const ids = new Set<number>();
  for (const item of activities) {
    const legacyId = parseActivityLegacyId(item.activityLegacyId ?? item.id);
    if (legacyId != null) {
      ids.add(legacyId);
    }
  }
  return [...ids];
}

function toWatchLineupGoals(goals: UserGoal[]): WatchLineupGoalRef[] {
  return goals
    .filter((goal) => goal.kind === 'watch_lineup' && goal.status === 'active')
    .map((goal) => ({
      activityLegacyId: goal.activityLegacyId,
      goalId: goal._id,
    }));
}

export const useActivitySubscriptionStore = create<ActivitySubscriptionState>(
  (set, get) => ({
    registeredLegacyIds: [],
    watchLineupGoals: [],
    hydrated: false,

    setFromServer(activities, goals) {
      set({
        registeredLegacyIds: toRegisteredLegacyIds(activities),
        watchLineupGoals: toWatchLineupGoals(goals),
        hydrated: true,
      });
    },

    applySubscribe(activityLegacyId, goal) {
      set((state) => {
        const registeredLegacyIds = state.registeredLegacyIds.includes(activityLegacyId)
          ? state.registeredLegacyIds
          : [...state.registeredLegacyIds, activityLegacyId];

        let watchLineupGoals = state.watchLineupGoals;
        if (goal?.kind === 'watch_lineup' && goal.status === 'active') {
          watchLineupGoals = [
            ...state.watchLineupGoals.filter(
              (item) => item.activityLegacyId !== activityLegacyId,
            ),
            { activityLegacyId, goalId: goal._id },
          ];
        }

        return {
          registeredLegacyIds,
          watchLineupGoals,
          hydrated: true,
        };
      });
    },

    applyUnsubscribe(activityLegacyId) {
      set((state) => ({
        watchLineupGoals: state.watchLineupGoals.filter(
          (goal) => goal.activityLegacyId !== activityLegacyId,
        ),
        hydrated: true,
      }));
    },

    isRegistered(activityLegacyId) {
      return get().registeredLegacyIds.includes(activityLegacyId);
    },

    hasWatchLineup(activityLegacyId) {
      return get().watchLineupGoals.some(
        (goal) => goal.activityLegacyId === activityLegacyId,
      );
    },

    clear() {
      set({
        registeredLegacyIds: [],
        watchLineupGoals: [],
        hydrated: false,
      });
    },
  }),
);

export function clearActivitySubscriptionStore(): void {
  useActivitySubscriptionStore.getState().clear();
}

export function markActivityWechatOptIn(activityLegacyId: number): void {
  markActivityUpdateSubscribedLocally(activityLegacyId);
}

export function clearActivityWechatOptIn(activityLegacyId: number): void {
  clearActivityUpdateSubscribedLocally(activityLegacyId);
}

export function hasActivityWechatOptIn(activityLegacyId: number): boolean {
  return isActivityUpdateSubscribedLocally(activityLegacyId);
}
