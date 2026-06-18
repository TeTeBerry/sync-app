import { useCallback, useState } from 'react';
import Taro from '@tarojs/taro';
import { useProfilePostsQuery } from './sync/profile';
import {
  buildBuddyPostLimitToast,
  resolveBuddyPostQuota,
  type BuddyPostQuota,
} from '../utils/buddyPostQuota';

export type BuddyPostSheetQuota = Pick<BuddyPostQuota, 'used' | 'max'>;

export function useBuddyPostQuotaGate(options: {
  activityLegacyId?: number;
  activityTitle?: string;
}) {
  const profilePostsQuery = useProfilePostsQuery();
  const [sheetPostQuota, setSheetPostQuota] = useState<BuddyPostSheetQuota | null>(
    null,
  );

  const clearSheetPostQuota = useCallback(() => {
    setSheetPostQuota(null);
  }, []);

  const ensureCanOpenBuddyPostSheet = useCallback(async (): Promise<boolean> => {
    const legacyId = options.activityLegacyId;
    if (legacyId == null || !Number.isFinite(legacyId) || legacyId <= 0) {
      setSheetPostQuota(null);
      return true;
    }

    const refreshedPosts = await profilePostsQuery.refetch();
    const posts = refreshedPosts ?? profilePostsQuery.data ?? [];
    const quota = resolveBuddyPostQuota(posts, legacyId);

    if (quota.atLimit) {
      setSheetPostQuota(null);
      void Taro.showToast({
        title: buildBuddyPostLimitToast(options.activityTitle ?? '', quota.max),
        icon: 'none',
        duration: 3500,
      });
      return false;
    }

    setSheetPostQuota({ used: quota.used, max: quota.max });
    return true;
  }, [options.activityLegacyId, options.activityTitle, profilePostsQuery]);

  return {
    sheetPostQuota,
    ensureCanOpenBuddyPostSheet,
    clearSheetPostQuota,
  };
}
