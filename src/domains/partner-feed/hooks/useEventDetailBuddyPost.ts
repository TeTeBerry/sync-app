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
  updateBuddyPostFromForm,
} from '../../../utils/publishBuddyPost';
import { parseBuddyPostFormFromPost } from '../utils/parseBuddyPostFormFromPost';
import { requestPostEngagementSubscribe } from '../../../utils/wechatSubscribeMessage';
import { isApiEnabled } from '../../../constants/api';
import { getClientUserId } from '../../../utils/session';
import { BUDDY_POST_PUBLISH_SUCCESS_MESSAGE } from '../../../constants/ugcPublishCompliance';
import { useOverlayLockStore } from '../../../stores/overlayLockStore';
import { requireAuth } from '../../../utils/authGate';
import { t } from '@/i18n/translate';

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
    patchPost?: (post: EventDetailPost) => void;
    accountRiskEnabled?: boolean;
    freezeScroll?: () => void;
    releaseScroll?: () => void;
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
  const [editingPost, setEditingPost] = useState<EventDetailPost | null>(null);
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
    onBeforeOpen: options.freezeScroll,
    onInvalidActivity: () => {
      void Taro.showToast({ title: '活动信息无效', icon: 'none' });
    },
  });

  const openBuddyPostSheet = useCallback(() => {
    void openSheet();
  }, [openSheet]);

  const closeBuddyPostSheet = useCallback(() => {
    closeSheet();
    useOverlayLockStore.getState().reset();
    setSheetInitialValues(null);
    setSheetPrefillSummaryLines(null);
    setSheetPrefillBannerTitle(null);
    setEditingPost(null);
    options.releaseScroll?.();
  }, [closeSheet, options]);

  const openEditBuddyPostSheet = useCallback(
    (post: EventDetailPost) => {
      if (!Number.isFinite(eventId) || eventId <= 0) return;

      requireAuth(async () => {
        if (!(await guardPublish())) {
          return;
        }

        const initialValues = parseBuddyPostFormFromPost(post, options.activityDate);
        if (!initialValues) {
          void Taro.showToast({ title: '活动日期无效，暂无法编辑', icon: 'none' });
          return;
        }

        options.freezeScroll?.();
        setEditingPost(post);
        setSheetInitialValues(initialValues);
        setSheetPrefillSummaryLines(null);
        setSheetPrefillBannerTitle(null);
        setSheetOpen(true);
      }, 'activity');
    },
    [eventId, guardPublish, options, setSheetOpen],
  );

  const handleBuddyPostSheetSubmit = useCallback(
    async (
      payload: AiBuddyPostSubmitPayload,
      submitOptions?: {
        quiet?: boolean;
        skipListRefresh?: boolean;
        listedInFeed?: boolean;
      },
    ): Promise<void> => {
      if (!Number.isFinite(eventId) || eventId <= 0) return;
      if (publishingRef.current) return;

      publishingRef.current = true;

      if (!(await guardPublish())) {
        publishingRef.current = false;
        return;
      }

      if (!isApiEnabled()) {
        publishingRef.current = false;
        void Taro.showToast({ title: '请先配置 API 地址', icon: 'none' });
        return;
      }

      const { syncToPostList: _sync, ...form } = payload;
      const title = options.activityTitle?.trim() || '本场活动';
      const listedInFeed =
        submitOptions?.listedInFeed ?? payload.syncToPostList !== false;
      const pendingId = `pending-${Date.now()}`;
      const postBeingEdited = editingPost;
      const editingPostId = postBeingEdited?.id;

      setIsPublishing(true);
      setSheetOpen(false);
      setSheetInitialValues(null);
      setSheetPrefillSummaryLines(null);
      setSheetPrefillBannerTitle(null);
      setEditingPost(null);
      options.releaseScroll?.();

      if (editingPostId && postBeingEdited) {
        try {
          const updated = await updateBuddyPostFromForm({
            postId: editingPostId,
            form,
            recruitStatus: postBeingEdited.recruitStatus,
          });
          options.patchPost?.(updated);
          void Taro.showToast({
            title: t('eventDetail.buddyPostUpdated'),
            icon: 'success',
          });
        } catch (error) {
          if (await handlePublishError(error)) {
            return;
          }
          const message =
            error instanceof Error ? error.message : '更新失败，请稍后重试';
          void Taro.showToast({ title: message, icon: 'none' });
          options.freezeScroll?.();
          setEditingPost(postBeingEdited);
          setSheetInitialValues(form);
          setSheetOpen(true);
        } finally {
          publishingRef.current = false;
          setIsPublishing(false);
        }
        return;
      }

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
        void Taro.showToast({
          title: BUDDY_POST_PUBLISH_SUCCESS_MESSAGE,
          icon: 'success',
          duration: 3000,
        });
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
        void requestPostEngagementSubscribe();
      } catch (error) {
        if (!submitOptions?.skipListRefresh && listedInFeed) {
          options.removePost?.(pendingId);
        }
        if (await handlePublishError(error)) {
          return;
        }
        const message = error instanceof Error ? error.message : '发布失败，请稍后重试';
        void Taro.showToast({ title: message, icon: 'none' });
        options.freezeScroll?.();
        setSheetOpen(true);
      } finally {
        publishingRef.current = false;
        setIsPublishing(false);
      }
    },
    [editingPost, eventId, guardPublish, handlePublishError, options, setSheetOpen],
  );

  return {
    buddyPostSheetOpen: sheetOpen,
    isBuddyPostPublishing: isPublishing,
    isBuddyPostEditing: Boolean(editingPost),
    openBuddyPostSheet,
    openEditBuddyPostSheet,
    closeBuddyPostSheet,
    handleBuddyPostSheetSubmit,
    buddyPostSheetInitialValues: sheetInitialValues,
    buddyPostPrefillSummaryLines: sheetPrefillSummaryLines,
    buddyPostPrefillBannerTitle: sheetPrefillBannerTitle,
    buddyPostActivityDate: options.activityDate,
    buddyPostActivityTitle: options.activityTitle,
    complianceConfirmDialog,
    buddyPostQuota: sheetPostQuota
      ? {
          used: sheetPostQuota.used,
          max: sheetPostQuota.max,
          remaining: sheetPostQuota.max - sheetPostQuota.used,
          atLimit: sheetPostQuota.used >= sheetPostQuota.max,
        }
      : undefined,
  };
}
