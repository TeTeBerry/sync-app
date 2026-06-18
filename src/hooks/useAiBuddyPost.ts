import {
  useCallback,
  useRef,
  useState,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from 'react';
import Taro from '@tarojs/taro';
import { createMessageId } from './ai-chat/createMessageId';
import type { ChatUiMessage } from '../types/aiChat';
import type {
  AiBuddyPostFormValues,
  AiBuddyPostSubmitPayload,
  BuddyPostTagId,
} from '../types/buddyPost';
import type { AiGuidePlanFormValues } from '../types/travelGuide';
import { travelGuideFormToBuddyPrefill } from '../utils/travelGuideToBuddyPost';
import { isApiEnabled } from '../constants/api';
import {
  buildBuddyPostUserSummary,
  defaultBuddyPostFormWithTag,
} from '../utils/buddyPostForm';
import {
  startAiChatStagedProgress,
  withAiChatProgress,
} from '../utils/aiChatStagedProgress';
import { useUgcPublishGuard } from './useUgcPublishGuard';
import { useBuddyPostQuotaGate } from './useBuddyPostQuotaGate';
import { publishBuddyPostFromForm } from '../utils/publishBuddyPost';

export function useAiBuddyPost(options: {
  activityLegacyId?: number;
  activityTitle?: string;
  activityDate?: string;
  authorName: string;
  authorAvatar?: string;
  setMessages: Dispatch<SetStateAction<ChatUiMessage[]>>;
  messagesRef: MutableRefObject<ChatUiMessage[]>;
  isStreaming: boolean;
  onPublished?: () => void;
  onPlanningMessagesShown?: () => void;
}) {
  const {
    activityLegacyId,
    activityTitle,
    activityDate,
    authorName,
    authorAvatar,
    setMessages,
    messagesRef,
    isStreaming,
    onPublished,
    onPlanningMessagesShown,
  } = options;

  const [sheetOpen, setSheetOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [sheetInitialValues, setSheetInitialValues] =
    useState<AiBuddyPostFormValues | null>(null);
  const [sheetPrefillHint, setSheetPrefillHint] = useState<string[] | null>(null);
  const lastFormRef = useRef<AiBuddyPostFormValues | null>(null);
  const publishingRef = useRef(false);
  const { guardPublish, handlePublishError, complianceConfirmDialog } =
    useUgcPublishGuard();
  const { sheetPostQuota, ensureCanOpenBuddyPostSheet, clearSheetPostQuota } =
    useBuddyPostQuotaGate({
      activityLegacyId,
      activityTitle,
    });

  const tryOpenBuddyPostSheet = useCallback(async () => {
    const allowed = await guardPublish();
    if (!allowed) return false;
    return ensureCanOpenBuddyPostSheet();
  }, [ensureCanOpenBuddyPostSheet, guardPublish]);

  const openBuddyPostSheetWithTag = useCallback(
    (_tagId: BuddyPostTagId = 'team') => {
      if (isStreaming || publishingRef.current) {
        void Taro.showToast({ title: '请等待当前操作完成', icon: 'none' });
        return;
      }
      if (activityLegacyId == null || Number.isNaN(activityLegacyId)) {
        void Taro.showToast({ title: '请先进入活动后再发帖', icon: 'none' });
        return;
      }

      const prefill =
        defaultBuddyPostFormWithTag('team', activityDate) ??
        lastFormRef.current ??
        ({
          dateStart: '',
          dateEnd: '',
          location: '',
          headcount: '',
          tags: ['team'],
          note: '',
        } satisfies AiBuddyPostFormValues);

      setSheetPrefillHint(null);
      setSheetInitialValues({ ...prefill, tags: ['team'] });
      void tryOpenBuddyPostSheet().then((canOpen) => {
        if (canOpen) setSheetOpen(true);
      });
    },
    [activityDate, activityLegacyId, isStreaming, tryOpenBuddyPostSheet],
  );

  const openBuddyPostSheetFromTravelGuide = useCallback(
    (guideForm: AiGuidePlanFormValues) => {
      if (isStreaming || publishingRef.current) {
        void Taro.showToast({ title: '请等待当前操作完成', icon: 'none' });
        return;
      }
      if (activityLegacyId == null || Number.isNaN(activityLegacyId)) {
        void Taro.showToast({ title: '请先进入活动后再发帖', icon: 'none' });
        return;
      }
      const prefill = travelGuideFormToBuddyPrefill(guideForm, options.activityDate);
      setSheetInitialValues(prefill.form);
      setSheetPrefillHint(prefill.summaryLines);
      void tryOpenBuddyPostSheet().then((canOpen) => {
        if (!canOpen) return;
        setSheetOpen(true);
        void Taro.showToast({
          title: '已根据攻略预填，确认后发布',
          icon: 'none',
          duration: 2000,
        });
      });
    },
    [activityLegacyId, isStreaming, options.activityDate, tryOpenBuddyPostSheet],
  );

  const runPublish = useCallback(
    async (payload: AiBuddyPostSubmitPayload) => {
      if (activityLegacyId == null || Number.isNaN(activityLegacyId)) return;
      if (publishingRef.current) return;
      if (!(await guardPublish())) return;

      const { syncToPostList: _sync, ...form } = payload;
      const title = activityTitle?.trim() || '本场活动';
      publishingRef.current = true;
      setIsPublishing(true);
      lastFormRef.current = form;

      const userMsg: ChatUiMessage = {
        id: createMessageId(),
        from: 'user',
        text: buildBuddyPostUserSummary(form, title),
      };
      const aiMsgId = createMessageId();
      const planningMsg = withAiChatProgress(
        { id: aiMsgId, from: 'ai', text: '' },
        'buddy_post',
      );

      const base = [...messagesRef.current, userMsg, planningMsg];
      messagesRef.current = base;
      setMessages(base);
      Taro.nextTick(() => onPlanningMessagesShown?.());

      const stopStagedProgress = startAiChatStagedProgress({
        aiMsgId,
        kind: 'buddy_post',
        messagesRef,
        setMessages,
      });

      try {
        if (!isApiEnabled()) {
          throw new Error('请先配置 API 地址');
        }

        const { card } = await publishBuddyPostFromForm({
          form,
          activityLegacyId,
          activityTitle: title,
          authorName,
          authorAvatar,
        });

        const doneMsg: ChatUiMessage = {
          id: aiMsgId,
          from: 'ai',
          text: [
            `已为你发布「${title}」组队帖 ✅`,
            '',
            '点击下方卡片可在活动详情页查看。',
          ].join('\n'),
          createdPost: card,
        };

        messagesRef.current = messagesRef.current.map((m) =>
          m.id === aiMsgId ? doneMsg : m,
        );
        setMessages(messagesRef.current);
        onPublished?.();
        Taro.nextTick(() => onPlanningMessagesShown?.());
        void Taro.showToast({ title: '组队帖已发布', icon: 'success' });
      } catch (error) {
        if (await handlePublishError(error)) {
          messagesRef.current = messagesRef.current.map((m) =>
            m.id === aiMsgId ? { ...m, text: '发帖功能已受限', streaming: false } : m,
          );
          setMessages(messagesRef.current);
        } else {
          const message =
            error instanceof Error ? error.message : '发帖失败，请稍后重试';
          messagesRef.current = messagesRef.current.map((m) =>
            m.id === aiMsgId ? { ...m, text: message, streaming: false } : m,
          );
          setMessages(messagesRef.current);
          void Taro.showToast({ title: message, icon: 'none' });
        }
      } finally {
        stopStagedProgress();
        publishingRef.current = false;
        setIsPublishing(false);
      }
    },
    [
      activityLegacyId,
      activityTitle,
      authorAvatar,
      authorName,
      guardPublish,
      handlePublishError,
      messagesRef,
      onPlanningMessagesShown,
      onPublished,
      setMessages,
    ],
  );

  const handleSheetSubmit = useCallback(
    (payload: AiBuddyPostSubmitPayload) => {
      setSheetOpen(false);
      setSheetPrefillHint(null);
      void runPublish(payload);
    },
    [runPublish],
  );

  const closeBuddyPostSheet = useCallback(() => {
    setSheetOpen(false);
    setSheetPrefillHint(null);
    clearSheetPostQuota();
  }, [clearSheetPostQuota]);

  return {
    sheetOpen,
    closeBuddyPostSheet,
    isPublishing,
    openBuddyPostSheetWithTag,
    openBuddyPostSheetFromTravelGuide,
    handleSheetSubmit,
    sheetInitialValues,
    sheetPrefillHint,
    complianceConfirmDialog,
    sheetPostQuota,
  };
}
