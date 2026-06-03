import Taro from '@tarojs/taro';
import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';
import {
  applyToPostAndInvalidate,
  useProfilePostsQuery,
} from '../../../hooks/useSyncApi';
import type { ConfirmDialogOptions } from '../../../hooks/useConfirmDialog';
import { requireAuth } from '../../../utils/authGate';
import { consumeContactUnlockWithQuota } from '../../../utils/contactUnlockEntitlement';
import {
  resolveUserBuddyPreviewForActivity,
  type TeamApplyBuddyPreview,
} from '../../../utils/teamApplyBuddyPreview';
import { userHasRecruitingBuddyPost } from '../../../utils/userRecruitingPost';
import type { EventDetailPost } from '../../../types/post';

export type UseEventDetailTeamApplyParams = {
  eventId: number;
  feedPosts: EventDetailPost[];
  appliedPostIds: Set<string>;
  setAppliedPostIds: Dispatch<SetStateAction<Set<string>>>;
  contactUnlockQuota: { exhausted: boolean };
  openContactUnlockExhaustedModal: () => void;
  /** Pin list scroll to the post being applied to. */
  onPrepareApplyAnchor: (postId: string) => void;
  /** Open buddy sheet while remembering which post the user intends to apply to. */
  onRequestBuddyPostForApply: (postId: string) => void;
  /** User cancelled before buddy sheet (e.g. dismiss confirm). */
  onAbortApplyFlow?: () => void;
  /** After apply sheet closes or application succeeds (e.g. refresh list without scrolling mid-flow). */
  onApplyFlowSettled?: () => void;
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
};

export function useEventDetailTeamApply({
  eventId,
  feedPosts,
  appliedPostIds,
  setAppliedPostIds,
  contactUnlockQuota,
  openContactUnlockExhaustedModal,
  onPrepareApplyAnchor,
  onRequestBuddyPostForApply,
  onAbortApplyFlow,
  onApplyFlowSettled,
  confirm,
}: UseEventDetailTeamApplyParams) {
  const profilePostsQuery = useProfilePostsQuery();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [targetPostId, setTargetPostId] = useState<string | null>(null);
  const [buddyPreview, setBuddyPreview] = useState<TeamApplyBuddyPreview | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const openApplySheet = useCallback(
    (postId: string, preview?: TeamApplyBuddyPreview | null) => {
      setTargetPostId(postId);
      setBuddyPreview(
        preview ??
          resolveUserBuddyPreviewForActivity(
            eventId,
            feedPosts,
            profilePostsQuery.data,
          ),
      );
      setSheetOpen(true);
    },
    [eventId, feedPosts, profilePostsQuery.data],
  );

  const closeApplySheet = useCallback(() => {
    if (submitting) return;
    setSheetOpen(false);
    setTargetPostId(null);
    setBuddyPreview(null);
    onApplyFlowSettled?.();
  }, [onApplyFlowSettled, submitting]);

  const submitApplication = useCallback(
    async (postId: string, message: string) => {
      setSubmitting(true);
      try {
        const result = await applyToPostAndInvalidate(
          postId,
          message ? { message } : undefined,
        );
        if (!result.alreadyApplied) {
          const consumed = await consumeContactUnlockWithQuota(eventId);
          if (!consumed) {
            openContactUnlockExhaustedModal();
            return;
          }
        }

        setAppliedPostIds((prev) => new Set(prev).add(postId));
        setSheetOpen(false);
        setTargetPostId(null);
        setBuddyPreview(null);
        onApplyFlowSettled?.();
        const toastTitle = result.alreadyApplied ? '已申请' : '申请成功';
        void Taro.showToast({ title: toastTitle, icon: 'success' });
      } catch {
        void Taro.showToast({ title: '申请失败', icon: 'none' });
      } finally {
        setSubmitting(false);
      }
    },
    [eventId, onApplyFlowSettled, openContactUnlockExhaustedModal, setAppliedPostIds],
  );

  const handleConfirmApply = useCallback(
    (message: string) => {
      if (!targetPostId || submitting) return;
      void submitApplication(targetPostId, message);
    },
    [submitApplication, submitting, targetPostId],
  );

  const handleApply = useCallback(
    (postId: string) => {
      if (appliedPostIds.has(postId)) return;

      requireAuth(() => {
        if (contactUnlockQuota.exhausted) {
          openContactUnlockExhaustedModal();
          return;
        }

        const hasBuddyPost = userHasRecruitingBuddyPost(
          eventId,
          feedPosts,
          profilePostsQuery.data,
        );

        onPrepareApplyAnchor(postId);

        if (!hasBuddyPost) {
          void confirm({
            title: '先填写组队信息',
            message: '申请组队前需要先发布你的组队信息，方便对方了解你的需求。',
            confirmText: '去填写',
            cancelText: '取消',
          }).then((ok) => {
            if (ok) onRequestBuddyPostForApply(postId);
            else onAbortApplyFlow?.();
          });
          return;
        }

        openApplySheet(postId);
      }, 'post');
    },
    [
      appliedPostIds,
      confirm,
      contactUnlockQuota.exhausted,
      eventId,
      feedPosts,
      onAbortApplyFlow,
      onPrepareApplyAnchor,
      onRequestBuddyPostForApply,
      openApplySheet,
      openContactUnlockExhaustedModal,
      profilePostsQuery.data,
    ],
  );

  return {
    applySheetOpen: sheetOpen,
    applyBuddyPreview: buddyPreview,
    applySubmitting: submitting,
    handleApply,
    closeApplySheet,
    handleConfirmApply,
    openApplySheet,
  };
}
