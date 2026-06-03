import { useCallback, useState } from 'react';
import Taro from '@tarojs/taro';
import {
  invalidatePostQueries,
  useActivityDetailQuery,
} from '../../../hooks/useSyncApi';
import { publishBuddyPostFromForm } from '../../../utils/publishBuddyPost';
import { isApiEnabled } from '../../../constants/api';
import type { EventDetailPost } from '../../../types/post';
import type { AiBuddyPostFormValues } from '../../../types/buddyPost';

/** Buddy-post plan sheet on event detail — publish in place, refresh post list. */
export function useEventDetailBuddyPost(
  eventId: number,
  options: {
    authorName: string;
    authorAvatar?: string;
    /** Refetch activity post list (useEventPostsInfiniteQuery is not on useApiQuery cache). */
    refreshPosts?: () => Promise<void>;
    /** Optimistic insert so the feed updates before refetch completes. */
    prependPost?: (post: EventDetailPost) => void;
  },
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
    async (
      form: AiBuddyPostFormValues,
      submitOptions?: {
        quiet?: boolean;
        skipListRefresh?: boolean;
        listedInFeed?: boolean;
      },
    ): Promise<boolean> => {
      if (!Number.isFinite(eventId) || eventId <= 0) return false;
      if (isPublishing) return false;

      setIsPublishing(true);
      setSheetOpen(false);

      try {
        if (!isApiEnabled()) {
          throw new Error('请先配置 API 地址');
        }

        const title = activityQuery.data?.name?.trim() || '本场活动';
        const listedInFeed = submitOptions?.listedInFeed !== false;
        const { post } = await publishBuddyPostFromForm({
          form,
          activityLegacyId: eventId,
          activityTitle: title,
          authorName: options.authorName,
          authorAvatar: options.authorAvatar,
          listedInFeed,
        });

        if (!submitOptions?.quiet) {
          void Taro.showToast({ title: '组队帖已发布', icon: 'success' });
        }

        if (!submitOptions?.skipListRefresh) {
          if (listedInFeed) {
            options.prependPost?.(post);
          }
          void (async () => {
            await invalidatePostQueries();
            try {
              await options.refreshPosts?.();
            } catch {
              // List refresh is best-effort; publish already succeeded.
            }
          })();
        }
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : '发帖失败，请稍后重试';
        void Taro.showToast({ title: message, icon: 'none' });
        setSheetOpen(true);
        return false;
      } finally {
        setIsPublishing(false);
      }
    },
    [activityQuery.data?.name, eventId, isPublishing, options],
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
