import { beforeEach, describe, expect, it, vi } from 'vitest';
import { subscribeToActivityUpdates } from '@/utils/subscribeToActivityUpdates';
import { createUserGoalAndInvalidate } from '@/hooks/sync/goals';
import { refreshHomeSummaryFromServer } from '@/hooks/sync/activities';
import { refreshProfileActivitiesFromServer } from '@/hooks/sync/profile';
import { markActivityUpdateSubscribedLocally } from '@/utils/activityUpdateSubscribeStorage';
import { requestActivityUpdateSubscribe } from '@/utils/wechatSubscribeMessage';
import {
  patchActivitySelectionInCaches,
  patchProfileActivitiesOnSubscribe,
  patchProfileSummaryOnSelection,
} from '@/cache/activityCache';
import { patchPersistedHomeSummaryGoingFlag } from '@/utils/homeCacheStorage';

const applySubscribe = vi.fn();

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
        applySubscribe,
      }),
    }),
  };
});

vi.mock('@/utils/appToast', () => ({
  showAppToast: vi.fn(),
}));

vi.mock('@/constants/api', () => ({
  isApiEnabled: vi.fn(() => true),
  isLiveApi: vi.fn(() => true),
  API_BASE_URL: 'https://api.test',
}));

vi.mock('@/hooks/sync/goals', () => ({
  createUserGoalAndInvalidate: vi.fn(),
}));

vi.mock('@/hooks/sync/activities', () => ({
  refreshHomeSummaryFromServer: vi.fn(),
  unregisterForActivityAndInvalidate: vi.fn(),
}));

vi.mock('@/hooks/sync/profile', () => ({
  refreshProfileActivitiesFromServer: vi.fn(),
}));

vi.mock('@/utils/authStorage', () => ({
  isLoggedIn: vi.fn(() => true),
}));

vi.mock('@/utils/activityUpdateSubscribeStorage', () => ({
  isActivityUpdateSubscribedLocally: vi.fn(),
  markActivityUpdateSubscribedLocally: vi.fn(),
  clearActivityUpdateSubscribedLocally: vi.fn(),
}));

vi.mock('@/utils/wechatSubscribeMessage', () => ({
  isActivityUpdateSubscribeConfigured: vi.fn(() => true),
  requestActivityUpdateSubscribe: vi.fn(),
}));

vi.mock('@/cache/activityCache', () => ({
  patchActivitySelectionInCaches: vi.fn(),
  patchProfileActivitiesOnSubscribe: vi.fn(),
  patchProfileSummaryOnSelection: vi.fn(),
}));

vi.mock('@/utils/homeCacheStorage', () => ({
  patchPersistedHomeSummaryGoingFlag: vi.fn(),
}));

describe('subscribeToActivityUpdates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createUserGoalAndInvalidate).mockResolvedValue({
      _id: 'goal-1',
      userId: 'user-1',
      activityLegacyId: 8,
      kind: 'watch_lineup',
      status: 'active',
    });
    vi.mocked(patchProfileActivitiesOnSubscribe).mockReturnValue(true);
  });

  it('creates watch_lineup goal and syncs global subscription store when WeChat accepts', async () => {
    vi.mocked(requestActivityUpdateSubscribe).mockResolvedValue('accepted');

    await expect(subscribeToActivityUpdates(8)).resolves.toBe('wechat_accepted');
    expect(createUserGoalAndInvalidate).toHaveBeenCalledWith({
      activityLegacyId: 8,
      kind: 'watch_lineup',
      params: { notifyWechat: true },
    });
    expect(applySubscribe).toHaveBeenCalledWith(
      8,
      expect.objectContaining({ _id: 'goal-1' }),
    );
    expect(patchProfileActivitiesOnSubscribe).toHaveBeenCalledWith(8);
    expect(patchActivitySelectionInCaches).toHaveBeenCalledWith({
      legacyId: 8,
      going: true,
    });
    expect(patchPersistedHomeSummaryGoingFlag).toHaveBeenCalledWith(8, true);
    expect(patchProfileSummaryOnSelection).toHaveBeenCalledWith({
      isNewSelection: true,
    });
    expect(refreshHomeSummaryFromServer).toHaveBeenCalled();
    expect(refreshProfileActivitiesFromServer).toHaveBeenCalled();
    expect(markActivityUpdateSubscribedLocally).toHaveBeenCalledWith(8);
  });

  it('creates goal without wechat opt-in when WeChat is rejected', async () => {
    vi.mocked(requestActivityUpdateSubscribe).mockResolvedValue('rejected');

    await expect(subscribeToActivityUpdates(8)).resolves.toBe('in_app_only');
    expect(createUserGoalAndInvalidate).toHaveBeenCalledWith({
      activityLegacyId: 8,
      kind: 'watch_lineup',
      params: { notifyWechat: false },
    });
    expect(markActivityUpdateSubscribedLocally).toHaveBeenCalledWith(8);
  });

  it('returns register_failed when goal creation fails', async () => {
    vi.mocked(requestActivityUpdateSubscribe).mockResolvedValue('accepted');
    vi.mocked(createUserGoalAndInvalidate).mockRejectedValue(new Error('fail'));

    await expect(subscribeToActivityUpdates(8)).resolves.toBe('register_failed');
    expect(markActivityUpdateSubscribedLocally).not.toHaveBeenCalled();
    expect(applySubscribe).not.toHaveBeenCalled();
  });
});
