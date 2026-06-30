import { beforeEach, describe, expect, it, vi } from 'vitest';
import { unsubscribeFromActivityUpdates } from '@/utils/subscribeToActivityUpdates';
import {
  unregisterForActivityAndInvalidate,
  refreshHomeSummaryFromServer,
} from '@/hooks/sync/activities';
import { deleteUserGoalAndInvalidate } from '@/hooks/sync/goals';
import { fetchUserGoals } from '@/api/sync/goals';
import { clearActivityUpdateSubscribedLocally } from '@/utils/activityUpdateSubscribeStorage';
import { invalidateProfileActivities } from '@/utils/queryInvalidation';
import { refreshProfileActivitiesFromServer } from '@/hooks/sync/profile';
import { patchPersistedHomeSummaryGoingFlag } from '@/utils/homeCacheStorage';
import { showAppToast } from '@/utils/appToast';

const applyUnsubscribe = vi.fn();

vi.mock('@/utils/appToast', () => ({
  showAppToast: vi.fn(),
}));

vi.mock('@/constants/api', () => ({
  isApiEnabled: vi.fn(() => true),
  isLiveApi: vi.fn(() => true),
  API_BASE_URL: 'https://api.test',
}));

vi.mock('@/hooks/sync/activities', () => ({
  unregisterForActivityAndInvalidate: vi.fn(),
  refreshHomeSummaryFromServer: vi.fn(),
}));

vi.mock('@/hooks/sync/goals', () => ({
  deleteUserGoalAndInvalidate: vi.fn(),
}));

vi.mock('@/hooks/sync/profile', () => ({
  refreshProfileActivitiesFromServer: vi.fn(),
}));

vi.mock('@/api/sync/goals', () => ({
  fetchUserGoals: vi.fn(),
}));

vi.mock('@/utils/authStorage', () => ({
  isLoggedIn: vi.fn(() => true),
}));

vi.mock('@/utils/activityUpdateSubscribeStorage', () => ({
  clearActivityUpdateSubscribedLocally: vi.fn(),
}));

vi.mock('@/utils/queryInvalidation', () => ({
  invalidateProfileActivities: vi.fn(),
}));

vi.mock('@/utils/homeCacheStorage', () => ({
  patchPersistedHomeSummaryGoingFlag: vi.fn(),
}));

vi.mock('@/stores/activitySubscriptionStore', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/stores/activitySubscriptionStore')>();
  const originalGetState = actual.useActivitySubscriptionStore.getState.bind(
    actual.useActivitySubscriptionStore,
  );
  return {
    ...actual,
    useActivitySubscriptionStore: Object.assign(actual.useActivitySubscriptionStore, {
      getState: () => ({
        ...originalGetState(),
        applyUnsubscribe,
      }),
    }),
  };
});

describe('unsubscribeFromActivityUpdates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchUserGoals).mockResolvedValue([]);
    vi.mocked(unregisterForActivityAndInvalidate).mockResolvedValue({
      ok: true,
      activityLegacyId: 8,
      wasRegistered: true,
      attendees: 4,
    });
    vi.mocked(refreshProfileActivitiesFromServer).mockResolvedValue(undefined);
    vi.mocked(patchPersistedHomeSummaryGoingFlag).mockReturnValue(true);
  });

  it('clears local state and unregisters when no goal exists', async () => {
    await expect(unsubscribeFromActivityUpdates(8)).resolves.toBe('success');
    expect(clearActivityUpdateSubscribedLocally).toHaveBeenCalledWith(8);
    expect(unregisterForActivityAndInvalidate).toHaveBeenCalledWith(8);
    expect(deleteUserGoalAndInvalidate).not.toHaveBeenCalled();
    expect(patchPersistedHomeSummaryGoingFlag).toHaveBeenCalledWith(8, false);
    expect(invalidateProfileActivities).toHaveBeenCalled();
    expect(refreshProfileActivitiesFromServer).toHaveBeenCalled();
    expect(refreshHomeSummaryFromServer).toHaveBeenCalled();
    expect(applyUnsubscribe).toHaveBeenCalledWith(8);
    expect(showAppToast).toHaveBeenCalledWith('eventCard.unfollowSuccess', {
      icon: 'none',
    });
  });

  it('deletes watch_lineup goal and still unregisters client caches when goal exists', async () => {
    vi.mocked(fetchUserGoals).mockResolvedValue([
      {
        _id: 'goal-1',
        userId: 'u1',
        activityLegacyId: 8,
        kind: 'watch_lineup',
        status: 'active',
      },
    ]);

    await expect(unsubscribeFromActivityUpdates(8)).resolves.toBe('success');
    expect(deleteUserGoalAndInvalidate).toHaveBeenCalledWith('goal-1');
    expect(unregisterForActivityAndInvalidate).toHaveBeenCalledWith(8);
    expect(patchPersistedHomeSummaryGoingFlag).toHaveBeenCalledWith(8, false);
    expect(refreshProfileActivitiesFromServer).toHaveBeenCalled();
  });

  it('returns unregister_failed when API call fails', async () => {
    vi.mocked(fetchUserGoals).mockRejectedValue(new Error('fail'));

    await expect(unsubscribeFromActivityUpdates(8)).resolves.toBe('unregister_failed');
    expect(clearActivityUpdateSubscribedLocally).toHaveBeenCalledWith(8);
  });
});
