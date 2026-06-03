import { useCallback, useState } from 'react';
import Taro from '@tarojs/taro';
import { invalidatePostQueries } from '../../../hooks/useSyncApi';
import { useAccountRisk } from '../../../hooks/useSyncApi';
import { publishBuddyPostFromForm } from '../../../utils/publishBuddyPost';
import { isApiEnabled } from '../../../constants/api';
import type { EventDetailPost } from '../../../types/post';
import type { AiBuddyPostFormValues } from '../../../types/buddyPost';
import {
  ONSITE_INTENT_PREFILL_BANNER_TITLE,
  buildOnsiteBuddyPostForm,
  buildOnsiteIntentPrefillSummaryLines,
  type OnsiteBuddyPostIntentId,
} from '../../../constants/onsiteBuddyPostIntents';

export type BuddySheetPrefillState = {
  initialValues: AiBuddyPostFormValues;
  summaryLines: string[];
  bannerTitle: string;
  showOnSiteBadgeHint: boolean;
  submitLabel: string;
};

/** Buddy-post plan sheet on event detail — publish in place, refresh post list. */
export function useEventDetailBuddyPost(
  eventId: number,
  options: {
    activityTitle?: string;
    activityDate?: string;
    activityLocation?: string;
    authorName: string;
    authorAvatar?: string;
    /** Refetch activity post list (useEventPostsInfiniteQuery is not on useApiQuery cache). */
    refreshPosts?: () => Promise<void>;
    /** Optimistic insert so the feed updates before refetch completes. */
    prependPost?: (post: EventDetailPost) => void;
    /** Defer users/me until secondaryReady to cut first-screen requests. */
    accountRiskEnabled?: boolean;
    /** When true, chip prefill copy mentions wristband →「我在现场」badge. */
    hintOnSiteBadge?: boolean;
  },
) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [sheetPrefill, setSheetPrefill] = useState<BuddySheetPrefillState | null>(null);
  const { guardPublish, handlePublishError } = useAccountRisk({
    enabled: options.accountRiskEnabled ?? true,
  });

  const clearSheetPrefill = useCallback(() => {
    setSheetPrefill(null);
  }, []);

  const openBuddyPostSheet = useCallback(() => {
    if (!Number.isFinite(eventId) || eventId <= 0) {
      void Taro.showToast({ title: '活动信息无效', icon: 'none' });
      return;
    }
    clearSheetPrefill();
    void guardPublish().then((allowed) => {
      if (allowed) setSheetOpen(true);
    });
  }, [clearSheetPrefill, eventId, guardPublish]);

  const closeBuddyPostSheet = useCallback(() => {
    setSheetOpen(false);
    clearSheetPrefill();
  }, [clearSheetPrefill]);

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
      clearSheetPrefill();

      try {
        if (!isApiEnabled()) {
          throw new Error('请先配置 API 地址');
        }

        const title = options.activityTitle?.trim() || '本场活动';
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
          const toastTitle = post.authorOnSiteVerified
            ? '已发布 · 我在现场'
            : '组队帖已发布';
          void Taro.showToast({ title: toastTitle, icon: 'success' });
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
      clearSheetPrefill,
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

      const form = buildOnsiteBuddyPostForm(
        intentId,
        options.activityDate,
        options.activityLocation,
      );
      if (!form) {
        void Taro.showToast({ title: '无法解析活动日期', icon: 'none' });
        return;
      }

      setSheetPrefill({
        initialValues: form,
        summaryLines: buildOnsiteIntentPrefillSummaryLines(intentId, form),
        bannerTitle: ONSITE_INTENT_PREFILL_BANNER_TITLE,
        showOnSiteBadgeHint: options.hintOnSiteBadge !== false,
        submitLabel: '确认发布',
      });
      setSheetOpen(true);
    },
    [
      eventId,
      guardPublish,
      isPublishing,
      options.activityDate,
      options.activityLocation,
      options.hintOnSiteBadge,
    ],
  );

  return {
    buddyPostSheetOpen: sheetOpen,
    buddySheetInitialValues: sheetPrefill?.initialValues ?? null,
    buddySheetPrefillLines: sheetPrefill?.summaryLines ?? null,
    buddySheetPrefillTitle: sheetPrefill?.bannerTitle ?? null,
    buddySheetShowOnSiteBadgeHint: sheetPrefill?.showOnSiteBadgeHint ?? false,
    buddySheetSubmitLabel: sheetPrefill?.submitLabel ?? null,
    isBuddyPostPublishing: isPublishing,
    openBuddyPostSheet,
    closeBuddyPostSheet,
    handleBuddyPostSheetSubmit,
    publishOnsiteIntent,
    buddyPostActivityDate: options.activityDate,
    buddyPostActivityTitle: options.activityTitle,
  };
}
