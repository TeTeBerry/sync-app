import Taro from '@tarojs/taro';
import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';
import {
  applyToPostAndInvalidate,
  useProfilePostsQuery,
} from '../../../hooks/useSyncApi';
import { requireAuth } from '../../../utils/authGate';
import { consumeContactUnlockWithQuota } from '../../../utils/contactUnlockEntitlement';
import {
  resolveUserBuddyPreviewForTargetPost,
  type TeamApplyBuddyPreview,
} from '../../../utils/teamApplyBuddyPreview';
import { userHasRecruitingBuddyPost } from '../../../utils/userRecruitingPost';
import { promptOpenTeamChatAfterApply } from '../../../utils/promptTeamChatAfterApply';
import type { ConfirmDialogOptions } from '../../../hooks/useConfirmDialog';
import type { LightApplyDraft } from '../../../utils/lightApplyDraft';
import type { EventDetailPost } from '../../../types/post';
import type { TeamApplySheetMode } from '../../../components/post/TeamApplySheet';

export type UseEventDetailTeamApplyParams = {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
  eventId: number;
  feedPosts: EventDetailPost[];
  appliedPostIds: Set<string>;
  setAppliedPostIds: Dispatch<SetStateAction<Set<string>>>;
  contactUnlockQuota: { exhausted: boolean };
  openContactUnlockExhaustedModal: () => void;
  defaultDepartureCity?: string;
  onPrepareApplyAnchor: (postId: string) => void;
  onRequestCompleteBuddyPost?: () => void;
  onApplyFlowSettled?: () => void;
};

export function useEventDetailTeamApply({
  confirm,
  eventId,
  feedPosts,
  appliedPostIds,
  setAppliedPostIds,
  contactUnlockQuota,
  openContactUnlockExhaustedModal,
  defaultDepartureCity,
  onPrepareApplyAnchor,
  onRequestCompleteBuddyPost,
  onApplyFlowSettled,
}: UseEventDetailTeamApplyParams) {
  const profilePostsQuery = useProfilePostsQuery();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<TeamApplySheetMode>('full');
  const [targetPostId, setTargetPostId] = useState<string | null>(null);
  const [buddyPreview, setBuddyPreview] = useState<TeamApplyBuddyPreview | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const openApplySheet = useCallback(
    (
      postId: string,
      options?: {
        mode?: TeamApplySheetMode;
        preview?: TeamApplyBuddyPreview | null;
      },
    ) => {
      setTargetPostId(postId);
      const mode = options?.mode ?? 'full';
      setSheetMode(mode);

      const targetPost = feedPosts.find((post) => post.id === postId);
      if (mode === 'light') {
        setBuddyPreview(null);
      } else {
        setBuddyPreview(
          options?.preview ??
            (targetPost
              ? resolveUserBuddyPreviewForTargetPost(
                  targetPost,
                  eventId,
                  feedPosts,
                  profilePostsQuery.data,
                )
              : null),
        );
      }
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
    async (
      postId: string,
      payload: { message: string; lightApply?: LightApplyDraft },
    ) => {
      setSubmitting(true);
      const usedLightApply = Boolean(payload.lightApply?.departureCity?.trim());

      try {
        const apiPayload = payload.lightApply
          ? {
              lightApply: {
                departureCity: payload.lightApply.departureCity.trim(),
                ...(payload.lightApply.tripDays != null
                  ? { tripDays: payload.lightApply.tripDays }
                  : {}),
                ...(payload.lightApply.genderPref
                  ? { genderPref: payload.lightApply.genderPref }
                  : {}),
              },
              ...(payload.message ? { message: payload.message } : {}),
            }
          : payload.message
            ? { message: payload.message }
            : undefined;

        const result = await applyToPostAndInvalidate(postId, apiPayload);
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

        if (usedLightApply) {
          await promptOpenTeamChatAfterApply({
            confirm,
            teamChat: result.teamChat,
            lightApply: true,
            onCompleteBuddyPost: onRequestCompleteBuddyPost,
          });
        } else if (result.teamChat) {
          await promptOpenTeamChatAfterApply({ confirm, teamChat: result.teamChat });
        } else {
          const toastTitle = result.alreadyApplied ? '已申请' : '申请成功';
          void Taro.showToast({ title: toastTitle, icon: 'success' });
        }
      } catch {
        void Taro.showToast({ title: '申请失败', icon: 'none' });
      } finally {
        setSubmitting(false);
      }
    },
    [
      confirm,
      eventId,
      onApplyFlowSettled,
      onRequestCompleteBuddyPost,
      openContactUnlockExhaustedModal,
      setAppliedPostIds,
    ],
  );

  const handleConfirmApply = useCallback(
    (payload: { message: string; lightApply?: LightApplyDraft }) => {
      if (!targetPostId || submitting) return;
      void submitApplication(targetPostId, payload);
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
          openApplySheet(postId, { mode: 'light' });
          return;
        }

        openApplySheet(postId, { mode: 'full' });
      }, 'post');
    },
    [
      appliedPostIds,
      contactUnlockQuota.exhausted,
      eventId,
      feedPosts,
      onPrepareApplyAnchor,
      openApplySheet,
      openContactUnlockExhaustedModal,
      profilePostsQuery.data,
    ],
  );

  return {
    applySheetOpen: sheetOpen,
    applySheetMode: sheetMode,
    applyBuddyPreview: buddyPreview,
    applySubmitting: submitting,
    handleApply,
    closeApplySheet,
    handleConfirmApply,
    openApplySheet,
    defaultDepartureCity,
  };
}
