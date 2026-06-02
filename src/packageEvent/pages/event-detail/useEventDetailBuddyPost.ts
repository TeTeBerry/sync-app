import { useCallback, useState } from 'react';
import Taro from '@tarojs/taro';
import {
  invalidatePostQueries,
  useActivityDetailQuery,
} from '../../../hooks/useSyncApi';
import { invalidateCache } from '../../../hooks/useApiQuery';
import { publishBuddyPostFromForm } from '../../../utils/publishBuddyPost';
import { isApiEnabled } from '../../../constants/api';
import type { AiBuddyPostFormValues } from '../../../types/buddyPost';

/** Buddy-post plan sheet on event detail — publish in place, refresh post list. */
export function useEventDetailBuddyPost(
  eventId: number,
  options: { authorName: string; authorAvatar?: string },
) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const activityQuery = useActivityDetailQuery(eventId);

  const openBuddyPostSheet = useCallback(() => {
    if (!Number.isFinite(eventId) || eventId <= 0) {
      void Taro.showToast({ title: '活动信息无效', icon: 'none' });
      return;
    }
    setSheetOpen(true);
  }, [eventId]);

  const closeBuddyPostSheet = useCallback(() => {
    setSheetOpen(false);
  }, []);

  const handleBuddyPostSheetSubmit = useCallback(
    async (form: AiBuddyPostFormValues) => {
      if (!Number.isFinite(eventId) || eventId <= 0) return;
      if (isPublishing) return;

      setIsPublishing(true);
      setSheetOpen(false);

      try {
        if (!isApiEnabled()) {
          throw new Error('请先配置 API 地址');
        }

        const title = activityQuery.data?.name?.trim() || '本场活动';
        await publishBuddyPostFromForm({
          form,
          activityLegacyId: eventId,
          activityTitle: title,
          authorName: options.authorName,
          authorAvatar: options.authorAvatar,
        });

        await invalidatePostQueries();
        invalidateCache(['posts', 'activity', eventId]);

        void Taro.showToast({ title: '组队帖已发布', icon: 'success' });
      } catch (error) {
        const message = error instanceof Error ? error.message : '发帖失败，请稍后重试';
        void Taro.showToast({ title: message, icon: 'none' });
        setSheetOpen(true);
      } finally {
        setIsPublishing(false);
      }
    },
    [
      activityQuery.data?.name,
      eventId,
      isPublishing,
      options.authorAvatar,
      options.authorName,
    ],
  );

  return {
    buddyPostSheetOpen: sheetOpen,
    isBuddyPostPublishing: isPublishing,
    openBuddyPostSheet,
    closeBuddyPostSheet,
    handleBuddyPostSheetSubmit,
    buddyPostActivityDate: activityQuery.data?.date,
    buddyPostActivityTitle: activityQuery.data?.name,
  };
}
