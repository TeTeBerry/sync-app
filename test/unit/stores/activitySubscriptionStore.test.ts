import { beforeEach, describe, expect, it } from 'vitest';
import { useActivitySubscriptionStore } from '@/stores/activitySubscriptionStore';

describe('activitySubscriptionStore', () => {
  beforeEach(() => {
    useActivitySubscriptionStore.getState().clear();
  });

  it('hydrates registered activities and watch_lineup goals from server payloads', () => {
    useActivitySubscriptionStore.getState().setFromServer(
      [
        {
          id: '8',
          activityLegacyId: '8',
          title: 'EDC Korea 2026',
          date: '10/03-04',
          location: '仁川',
          image: '',
          status: 'registered',
        },
      ],
      [
        {
          _id: 'goal-1',
          userId: 'u1',
          activityLegacyId: 8,
          kind: 'watch_lineup',
          status: 'active',
        },
      ],
    );

    const state = useActivitySubscriptionStore.getState();
    expect(state.hydrated).toBe(true);
    expect(state.registeredLegacyIds).toEqual([8]);
    expect(state.watchLineupGoals).toEqual([{ activityLegacyId: 8, goalId: 'goal-1' }]);
    expect(state.isRegistered(8)).toBe(true);
    expect(state.hasWatchLineup(8)).toBe(true);
  });

  it('applyUnsubscribe removes watch_lineup goal but keeps registered activities', () => {
    useActivitySubscriptionStore.getState().setFromServer(
      [
        {
          id: '8',
          activityLegacyId: '8',
          title: 'EDC',
          date: '',
          location: '',
          image: '',
          status: 'registered',
        },
      ],
      [
        {
          _id: 'goal-1',
          userId: 'u1',
          activityLegacyId: 8,
          kind: 'watch_lineup',
          status: 'active',
        },
      ],
    );

    useActivitySubscriptionStore.getState().applyUnsubscribe(8);

    const state = useActivitySubscriptionStore.getState();
    expect(state.registeredLegacyIds).toEqual([8]);
    expect(state.watchLineupGoals).toEqual([]);
    expect(state.hasWatchLineup(8)).toBe(false);
    expect(state.isRegistered(8)).toBe(true);
  });
});
