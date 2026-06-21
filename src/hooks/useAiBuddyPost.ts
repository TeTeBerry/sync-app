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
import { useBuddyPostSheetController } from './useBuddyPostSheetController';
import { publishBuddyPostFromForm } from '../utils/publishBuddyPost';
import { BUDDY_POST_PUBLISH_SUCCESS_MESSAGE } from '../constants/ugcPublishCompliance';
import { t } from '@/i18n';

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

  const [isPublishing, setIsPublishing] = useState(false);
  const [sheetInitialValues, setSheetInitialValues] =
    useState<AiBuddyPostFormValues | null>(null);
  const [sheetPrefillHint, setSheetPrefillHint] = useState<string[] | null>(null);
  const lastFormRef = useRef<AiBuddyPostFormValues | null>(null);
  const publishingRef = useRef(false);
  const {
    sheetOpen,
    openSheet,
    closeSheet,
    sheetPostQuota,
    guardPublish,
    handlePublishError,
    complianceConfirmDialog,
  } = useBuddyPostSheetController({
    activityLegacyId,
    activityTitle,
  });

  const tryOpenBuddyPostSheet = useCallback(async () => {
    if (isStreaming || publishingRef.current) {
      void Taro.showToast({ title: t('common.pleaseWait'), icon: 'none' });
      return false;
    }
    if (activityLegacyId == null || Number.isNaN(activityLegacyId)) {
      void Taro.showToast({ title: t('common.pleaseEnterActivity'), icon: 'none' });
      return false;
    }
    return openSheet();
  }, [activityLegacyId, isStreaming, openSheet]);

  const openBuddyPostSheetWithTag = useCallback(
    (_tagId: BuddyPostTagId = 'team') => {
      if (isStreaming || publishingRef.current) {
        void Taro.showToast({ title: t('common.pleaseWait'), icon: 'none' });
        return;
      }
      if (activityLegacyId == null || Number.isNaN(activityLegacyId)) {
        void Taro.showToast({ title: t('common.pleaseEnterActivity'), icon: 'none' });
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
      void tryOpenBuddyPostSheet();
    },
    [activityDate, activityLegacyId, isStreaming, tryOpenBuddyPostSheet],
  );

  const openBuddyPostSheetFromTravelGuide = useCallback(
    (guideForm: AiGuidePlanFormValues) => {
      if (isStreaming || publishingRef.current) {
        void Taro.showToast({ title: t('common.pleaseWait'), icon: 'none' });
        return;
      }
      if (activityLegacyId == null || Number.isNaN(activityLegacyId)) {
        void Taro.showToast({ title: t('common.pleaseEnterActivity'), icon: 'none' });
        return;
      }
      const prefill = travelGuideFormToBuddyPrefill(guideForm, options.activityDate, t);
      setSheetInitialValues(prefill.form);
      setSheetPrefillHint(prefill.summaryLines);
      void tryOpenBuddyPostSheet().then((canOpen) => {
        if (!canOpen) return;
        void Taro.showToast({
          title: t('common.prefillFromGuide'),
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
          throw new Error(t('common.pleaseConfigureApi'));
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
            t('common.postPublished', { title }),
            '',
            t('common.viewInEventDetail'),
          ].join('\n'),
          createdPost: card,
        };

        messagesRef.current = messagesRef.current.map((m) =>
          m.id === aiMsgId ? doneMsg : m,
        );
        setMessages(messagesRef.current);
        onPublished?.();
        Taro.nextTick(() => onPlanningMessagesShown?.());
        void Taro.showToast({
          title: BUDDY_POST_PUBLISH_SUCCESS_MESSAGE,
          icon: 'success',
          duration: 3000,
        });
      } catch (error) {
        if (await handlePublishError(error)) {
          messagesRef.current = messagesRef.current.map((m) =>
            m.id === aiMsgId
              ? { ...m, text: t('common.postRestricted'), streaming: false }
              : m,
          );
          setMessages(messagesRef.current);
        } else {
          const message =
            error instanceof Error ? error.message : t('common.operationFailed');
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
      closeSheet();
      setSheetPrefillHint(null);
      return runPublish(payload);
    },
    [closeSheet, runPublish],
  );

  return {
    sheetOpen,
    closeBuddyPostSheet: closeSheet,
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
