import { useCallback, useRef, useState } from 'react';
import Taro from '@tarojs/taro';
import { useBuddyPostSheetController } from '../../../hooks/useBuddyPostSheetController';
import type { EventDetailPost } from '../../../types/post';
import type {
  AiBuddyPostFormValues,
  AiBuddyPostSubmitPayload,
} from '../../../types/buddyPost';
import {
  buildOptimisticBuddyPost,
  publishBuddyPostFromForm,
} from '../../../utils/publishBuddyPost';
import { isApiEnabled } from '../../../constants/api';
import { getClientUserId } from '../../../utils/session';

export type EventDetailBuddyPostPrefillOptions = {
  initialValues: AiBuddyPostFormValues;
  prefillSummaryLines?: string[];
  prefillBannerTitle?: string;
};

/** Structured message-board template sheet on event detail. */
export function useEventDetailBuddyPost(
  eventId: number,
  options: {
    activityTitle?: string;
    activityDate?: string;
    authorName: string;
    authorAvatar?: string;
    authorHandle?: string;
    buddyPostPrefill?: EventDetailBuddyPostPrefillOptions;
    refreshPosts?: (options?: { silent?: boolean }) => Promise<void>;
    prependPost?: (post: EventDetailPost) => void;
    replacePost?: (pendingId: string, post: EventDetailPost) => void;
    removePost?: (postId: string) => void;
    accountRiskEnabled?: boolean;
  },
) {
  const [isPublishing, setIsPublishing] = useState(false);
  const publishingRef = useRef(false);
  const [sheetInitialValues, setSheetInitialValues] =
    useState<AiBuddyPostFormValues | null>(
      () => options.buddyPostPrefill?.initialValues ?? null,
    );
  const [sheetPrefillSummaryLines, setSheetPrefillSummaryLines] = useState<
    string[] | null
  >(() => options.buddyPostPrefill?.prefillSummaryLines ?? null);
  const [sheetPrefillBannerTitle, setSheetPrefillBannerTitle] = useState<string | null>(
    () => options.buddyPostPrefill?.prefillBannerTitle ?? null,
  );
  const {
    sheetOpen,
    setSheetOpen,
    openSheet,
    closeSheet,
    sheetPostQuota,
    guardPublish,
    handlePublishError,
    complianceConfirmDialog,
  } = useBuddyPostSheetController({
    activityLegacyId: eventId,
    activityTitle: options.activityTitle,
    accountRiskEnabled: options.accountRiskEnabled,
    authScope: 'activity',
    onInvalidActivity: () => {
      void Taro.showToast({ title: '活动信息无效', icon: 'none' });
    },
  });

  const openBuddyPostSheet = useCallback(() => {
    void openSheet();
  }, [openSheet]);

  const closeBuddyPostSheet = useCallback(() => {
    closeSheet();
    setSheetInitialValues(null);
    setSheetPrefillSummaryLines(null);
    setSheetPrefillBannerTitle(null);
  }, [closeSheet]);

  const handleBuddyPostSheetSubmit = useCallback(
    async (
      payload: AiBuddyPostSubmitPayload,
      submitOptions?: {
        quiet?: boolean;
        skipListRefresh?: boolean;
        listedInFeed?: boolean;
      },
    ): Promise<boolean> => {
      if (!Number.isFinite(eventId) || eventId <= 0) return false;
      if (publishingRef.current) return false;

      publishingRef.current = true;

      if (!(await guardPublish())) {
        publishingRef.current = false;
        return false;
      }

      if (!isApiEnabled()) {
        publishingRef.current = false;
        void Taro.showToast({ title: '请先配置 API 地址', icon: 'none' });
        return false;
      }

      const { syncToPostList: _sync, ...form } = payload;
      const title = options.activityTitle?.trim() || '本场活动';
      const listedInFeed =
        submitOptions?.listedInFeed ?? payload.syncToPostList !== false;
      const pendingId = `pending-${Date.now()}`;

      setIsPublishing(true);
      setSheetOpen(false);
      setSheetInitialValues(null);
      setSheetPrefillSummaryLines(null);
      setSheetPrefillBannerTitle(null);

      if (!submitOptions?.skipListRefresh && listedInFeed) {
        options.prependPost?.(
          buildOptimisticBuddyPost({
            pendingId,
            form,
            authorName: options.authorName,
            authorAvatar: options.authorAvatar,
            authorHandle: options.authorHandle,
            userId: getClientUserId(),
          }),
        );
      }

      if (!submitOptions?.quiet) {
        void Taro.showToast({ title: '帖子已发布', icon: 'success' });
      }

      try {
        const { post } = await publishBuddyPostFromForm({
          form,
          activityLegacyId: eventId,
          activityTitle: title,
          authorName: options.authorName,
          authorAvatar: options.authorAvatar,
          listedInFeed,
        });

        if (!submitOptions?.skipListRefresh && listedInFeed) {
          options.replacePost?.(pendingId, post);
        }
        return true;
      } catch (error) {
        if (!submitOptions?.skipListRefresh && listedInFeed) {
          options.removePost?.(pendingId);
        }
        if (await handlePublishError(error)) {
          return false;
        }
        const message = error instanceof Error ? error.message : '发布失败，请稍后重试';
        void Taro.showToast({ title: message, icon: 'none' });
        setSheetOpen(true);
        return false;
      } finally {
        publishingRef.current = false;
        setIsPublishing(false);
      }
    },
    [eventId, guardPublish, handlePublishError, options, setSheetOpen],
  );

  return {
    buddyPostSheetOpen: sheetOpen,
    isBuddyPostPublishing: isPublishing,
    openBuddyPostSheet,
    closeBuddyPostSheet,
    handleBuddyPostSheetSubmit,
    buddyPostSheetInitialValues: sheetInitialValues,
    buddyPostPrefillSummaryLines: sheetPrefillSummaryLines,
    buddyPostPrefillBannerTitle: sheetPrefillBannerTitle,
    buddyPostActivityDate: options.activityDate,
    buddyPostActivityTitle: options.activityTitle,
    complianceConfirmDialog,
    buddyPostQuota: sheetPostQuota,
  };
}
