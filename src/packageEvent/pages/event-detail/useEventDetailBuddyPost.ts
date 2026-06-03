import { useCallback, useState } from 'react';
import Taro from '@tarojs/taro';
import {
  invalidatePostQueries,
  useActivityDetailQuery,
} from '../../../hooks/useSyncApi';
import { useAccountRisk } from '../../../hooks/useSyncApi';
import { publishBuddyPostFromForm } from '../../../utils/publishBuddyPost';
import { isApiEnabled } from '../../../constants/api';
import type { EventDetailPost } from '../../../types/post';
import type { AiBuddyPostFormValues } from '../../../types/buddyPost';
import {
  ONSITE_BUDDY_POST_INTENTS,
  buildOnsiteBuddyPostForm,
  formatOnsiteIntentModalContent,
  type OnsiteBuddyPostIntentId,
} from '../../../constants/onsiteBuddyPostIntents';

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
  const { guardPublish, handlePublishError } = useAccountRisk();

  const openBuddyPostSheet = useCallback(() => {
    if (!Number.isFinite(eventId) || eventId <= 0) {
      void Taro.showToast({ title: '活动信息无效', icon: 'none' });
      return;
    }
    void guardPublish().then((allowed) => {
      if (allowed) setSheetOpen(true);
    });
  }, [eventId, guardPublish]);

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

      if (!(await guardPublish())) return false;

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
        if (await handlePublishError(error)) {
          return false;
        }
        const message = error instanceof Error ? error.message : '发帖失败，请稍后重试';
        void Taro.showToast({ title: message, icon: 'none' });
        setSheetOpen(true);
        return false;
      } finally {
        setIsPublishing(false);
      }
    },
    [
      activityQuery.data?.name,
      eventId,
      guardPublish,
      handlePublishError,
      isPublishing,
      options,
    ],
  );

  const publishOnsiteIntent = useCallback(
    async (intentId: OnsiteBuddyPostIntentId) => {
      if (!Number.isFinite(eventId) || eventId <= 0) {
        void Taro.showToast({ title: '活动信息无效', icon: 'none' });
        return;
      }
      if (isPublishing) return;
      if (!(await guardPublish())) return;

      const activityDate = activityQuery.data?.date;
      const activityLocation = activityQuery.data?.location;
      const form = buildOnsiteBuddyPostForm(intentId, activityDate, activityLocation);
      if (!form) {
        void Taro.showToast({ title: '无法解析活动日期', icon: 'none' });
        return;
      }

      const intentLabel =
        ONSITE_BUDDY_POST_INTENTS.find((item) => item.id === intentId)?.label ??
        '发布组队帖';
      const summary = formatOnsiteIntentModalContent(form);

      const { confirm } = await Taro.showModal({
        title: `确认发布：${intentLabel}`,
        content: summary,
        confirmText: '发布',
        cancelText: '取消',
      });
      if (!confirm) return;

      await handleBuddyPostSheetSubmit(form, { listedInFeed: true });
    },
    [
      activityQuery.data?.date,
      activityQuery.data?.location,
      eventId,
      guardPublish,
      handleBuddyPostSheetSubmit,
      isPublishing,
    ],
  );

  return {
    buddyPostSheetOpen: sheetOpen,
    isBuddyPostPublishing: isPublishing,
    openBuddyPostSheet,
    closeBuddyPostSheet,
    handleBuddyPostSheetSubmit,
    publishOnsiteIntent,
    buddyPostActivityDate: activityQuery.data?.date,
    buddyPostActivityTitle: activityQuery.data?.name,
  };
}
