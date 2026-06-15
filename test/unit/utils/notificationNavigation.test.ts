import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NotificationMeta } from '@/types/backend';

vi.mock('@/api/sync/posts', () => ({
  fetchPostNavigationTarget: vi.fn(),
}));

vi.mock('@/cache/postCache', () => ({
  getPopularPostsFromCache: vi.fn(() => undefined),
}));

vi.mock('@/hooks/useApiQuery', () => ({
  getCacheData: vi.fn(() => undefined),
  forEachCacheEntry: vi.fn(),
}));

import { fetchPostNavigationTarget } from '@/api/sync/posts';
import { getPopularPostsFromCache } from '@/cache/postCache';
import { getCacheData } from '@/hooks/useApiQuery';
import { resolveNotificationPostTarget } from '@/utils/notificationNavigation';

describe('notificationNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resolves target from meta activityLegacyId', async () => {
    const target = await resolveNotificationPostTarget({
      postId: 'post-1',
      activityLegacyId: 4,
      type: 'post_hidden',
    });
    expect(target).toEqual({ postId: 'post-1', activityLegacyId: 4 });
    expect(fetchPostNavigationTarget).not.toHaveBeenCalled();
  });

  it('falls back to API when cache misses', async () => {
    vi.mocked(fetchPostNavigationTarget).mockResolvedValue({
      postId: 'post-abc',
      activityLegacyId: 7,
    });

    const target = await resolveNotificationPostTarget({
      postId: 'post-abc',
      type: 'post_hidden',
    } satisfies NotificationMeta);

    expect(target).toEqual({ postId: 'post-abc', activityLegacyId: 7 });
    expect(fetchPostNavigationTarget).toHaveBeenCalledWith('post-abc');
  });

  it('reads activityLegacyId from popular posts cache', async () => {
    vi.mocked(getPopularPostsFromCache).mockReturnValue([
      {
        id: 'post-2',
        activityLegacyId: 4,
      } as never,
    ]);

    const target = await resolveNotificationPostTarget({
      postId: 'post-2',
      type: 'activity_update',
    });

    expect(target).toEqual({ postId: 'post-2', activityLegacyId: 4 });
    expect(fetchPostNavigationTarget).not.toHaveBeenCalled();
  });

  it('reads activityLegacyId from profile posts cache', async () => {
    vi.mocked(getCacheData).mockReturnValue([
      {
        id: 'post-3',
        activityLegacyId: 5,
      },
    ]);

    const target = await resolveNotificationPostTarget({
      postId: 'post-3',
      type: 'activity_update',
    });

    expect(target).toEqual({ postId: 'post-3', activityLegacyId: 5 });
  });
});
