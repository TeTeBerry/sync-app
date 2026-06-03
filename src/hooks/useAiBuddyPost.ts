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
import type { AiBuddyPostFormValues } from '../types/buddyPost';
import { isApiEnabled } from '../constants/api';
import { buildBuddyPostUserSummary } from '../utils/buddyPostForm';
import { publishBuddyPostFromForm } from '../utils/publishBuddyPost';
import {
  buildBuddyPostCollectPrompt,
  buildBuddyPostSuggestedReplies,
  buddyPostDraftToForm,
  isBuddyPostChatInterrupt,
  listMissingBuddyPostSlots,
  mergeBuddyPostDraft,
  parseBuddyPostChatMessage,
  shouldHandleAsBuddyPostChat,
  type BuddyPostChatDraft,
} from '../utils/buddyPostChatParse';

const PUBLISHING_TEXT = '正在为你发布组队帖…';

export function useAiBuddyPost(options: {
  activityLegacyId?: number;
  activityTitle?: string;
  activityDate?: string;
  activityLocation?: string;
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
    activityLocation,
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
  const lastFormRef = useRef<AiBuddyPostFormValues | null>(null);
  const publishingRef = useRef(false);
  const collectActiveRef = useRef(false);
  const draftRef = useRef<BuddyPostChatDraft>({});

  const suggestContext = useCallback(
    () => ({
      activityDate,
      activityLocation,
    }),
    [activityDate, activityLocation],
  );

  const clearCollect = useCallback(() => {
    collectActiveRef.current = false;
    draftRef.current = {};
  }, []);

  const appendMessages = useCallback(
    (items: ChatUiMessage[]) => {
      const next = [...messagesRef.current, ...items];
      messagesRef.current = next;
      setMessages(next);
    },
    [messagesRef, setMessages],
  );

  const openBuddyPostSheet = useCallback(() => {
    if (isStreaming || publishingRef.current) {
      void Taro.showToast({ title: '请等待当前操作完成', icon: 'none' });
      return;
    }
    if (activityLegacyId == null || Number.isNaN(activityLegacyId)) {
      void Taro.showToast({ title: '请先进入活动后再发帖', icon: 'none' });
      return;
    }
    clearCollect();
    setSheetInitialValues(lastFormRef.current);
    setSheetOpen(true);
  }, [activityLegacyId, clearCollect, isStreaming]);

  const runPublish = useCallback(
    async (
      form: AiBuddyPostFormValues,
      options?: { skipUserBubble?: boolean; userBubbleText?: string },
    ) => {
      if (activityLegacyId == null || Number.isNaN(activityLegacyId)) return;
      if (publishingRef.current) return;

      const title = activityTitle?.trim() || '本场活动';
      publishingRef.current = true;
      setIsPublishing(true);
      lastFormRef.current = form;
      clearCollect();

      const userMsg: ChatUiMessage | null = options?.skipUserBubble
        ? null
        : {
            id: createMessageId(),
            from: 'user',
            text:
              options?.userBubbleText?.trim() || buildBuddyPostUserSummary(form, title),
          };
      const aiMsgId = createMessageId();
      const planningMsg: ChatUiMessage = {
        id: aiMsgId,
        from: 'ai',
        text: PUBLISHING_TEXT,
        streaming: true,
      };

      const base = options?.skipUserBubble
        ? [...messagesRef.current, planningMsg]
        : [...messagesRef.current, userMsg!, planningMsg];
      messagesRef.current = base;
      setMessages(base);
      Taro.nextTick(() => onPlanningMessagesShown?.());

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
            '点击下方卡片可在活动详情页查看，等待伙伴申请加入。',
          ].join('\n'),
          streaming: false,
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
        const message = error instanceof Error ? error.message : '发帖失败，请稍后重试';
        messagesRef.current = messagesRef.current.map((m) =>
          m.id === aiMsgId ? { ...m, text: message, streaming: false } : m,
        );
        setMessages(messagesRef.current);
        void Taro.showToast({ title: message, icon: 'none' });
      } finally {
        publishingRef.current = false;
        setIsPublishing(false);
      }
    },
    [
      activityLegacyId,
      activityTitle,
      authorAvatar,
      authorName,
      clearCollect,
      messagesRef,
      onPlanningMessagesShown,
      onPublished,
      setMessages,
    ],
  );

  const handleBuddyPostChatMessage = useCallback(
    async (userText: string): Promise<boolean> => {
      const trimmed = userText.trim();
      if (!trimmed) return false;
      if (activityLegacyId == null || Number.isNaN(activityLegacyId)) {
        return false;
      }
      if (isStreaming || publishingRef.current) {
        void Taro.showToast({ title: '请等待当前操作完成', icon: 'none' });
        return true;
      }

      if (isBuddyPostChatInterrupt(trimmed)) {
        clearCollect();
        return false;
      }

      const collecting = collectActiveRef.current;
      if (
        !shouldHandleAsBuddyPostChat({
          text: trimmed,
          collecting,
          activityDate,
        })
      ) {
        return false;
      }

      const parsed = parseBuddyPostChatMessage(trimmed, activityDate);
      const merged = mergeBuddyPostDraft(draftRef.current, parsed);
      draftRef.current = merged;
      collectActiveRef.current = true;

      appendMessages([
        {
          id: createMessageId(),
          from: 'user',
          text: trimmed,
        },
      ]);

      const form = buddyPostDraftToForm(merged);
      if (form) {
        await runPublish(form, { skipUserBubble: true });
        return true;
      }

      const missing = listMissingBuddyPostSlots(merged);
      appendMessages([
        {
          id: createMessageId(),
          from: 'ai',
          text: buildBuddyPostCollectPrompt(missing, suggestContext()),
          suggestedReplies: buildBuddyPostSuggestedReplies(missing, suggestContext()),
        },
      ]);
      Taro.nextTick(() => onPlanningMessagesShown?.());
      return true;
    },
    [
      activityDate,
      activityLegacyId,
      appendMessages,
      clearCollect,
      isStreaming,
      onPlanningMessagesShown,
      runPublish,
      suggestContext,
    ],
  );

  const handleSheetSubmit = useCallback(
    (form: AiBuddyPostFormValues) => {
      setSheetOpen(false);
      void runPublish(form);
    },
    [runPublish],
  );

  return {
    sheetOpen,
    setSheetOpen,
    isPublishing,
    openBuddyPostSheet,
    handleBuddyPostChatMessage,
    clearCollect,
    handleSheetSubmit,
    sheetInitialValues,
  };
}
