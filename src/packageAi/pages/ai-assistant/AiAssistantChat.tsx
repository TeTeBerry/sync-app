import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Taro from '@tarojs/taro';
import { useAiChatStream } from '../../../hooks/useAiChatStream';
import { getAuthHeaders } from '../../../utils/authStorage';
import { invalidatePostQueries } from '../../../hooks/useSyncApi';
import { ChatMessageList } from '../../../components/ai-chat/ChatMessageList';
import { ChatComposer } from '../../../components/ai-chat/ChatComposer';
import { DegradedMatchBanner } from '../../../components/ai-chat/DegradedMatchBanner';
import { useKeyboardInset } from '../../../hooks/useKeyboardInset';
import { API_BASE_URL } from '../../../constants/api';
import { uploadChatImageRefs } from '../../../utils/chatImage';
import type { inferUserGenderFromName } from '../../../utils/inferAuthorGender';
import { Text, View } from '@tarojs/components';
import { invalidateProfileEntitlements } from '../../../utils/queryInvalidation';
import { invalidateCache } from '../../../hooks/useApiQuery';

export type AiAssistantChatProps = {
  initialMessage?: string | null;
  activityLegacyId?: number;
  activityTitle?: string;
  onInitialMessageSent?: () => void;
  onMessageCountChange?: (count: number) => void;
  chatBodyHeight?: number;
  userAvatar?: string;
  userName: string;
  userGender?: ReturnType<typeof inferUserGenderFromName>;
  aiMatchQuotaExhausted: boolean;
};

export function AiAssistantChat({
  initialMessage,
  activityLegacyId,
  activityTitle,
  onInitialMessageSent,
  onMessageCountChange,
  chatBodyHeight,
  userAvatar,
  userName,
  userGender,
  aiMatchQuotaExhausted,
}: AiAssistantChatProps) {
  const [input, setInput] = useState('');
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const keyboardInset = useKeyboardInset();
  const initialMessageHandledRef = useRef(false);
  const submitLockRef = useRef(false);

  const mockReply = useCallback(
    (query: string) =>
      `正在为你搜索「${query}」相关内容 🔍 已找到 ${Math.floor(Math.random() * 5 + 3)} 条相关信息。`,
    [],
  );

  const welcomeText = useMemo(() => {
    if (activityTitle?.trim()) {
      return `👋 已为你锁定「${activityTitle.trim()}」。可以说说想找什么样的队友、住宿或出行方式，我来帮你匹配或发帖。`;
    }
    return '👋 我是你的 AI 智能助手，帮你发现活动、找队友、规划行程，说出需求，我来搞定。';
  }, [activityTitle]);

  const handleMatchResults = useCallback(async () => {
    if (!API_BASE_URL) return;
    await invalidateProfileEntitlements();
  }, []);

  const { messages, isStreaming, isLoadingHistory, send, clearChat } = useAiChatStream({
    welcomeText,
    mockReply,
    streamErrorText: '抱歉，回复出错了，请稍后再试。',
    activityLegacyId,
    getAuthHeaders,
    onPostCreated: async (event) => {
      await invalidatePostQueries();
      const scopedId = event.activityLegacyId ?? activityLegacyId;
      if (scopedId != null) {
        invalidateCache(['posts', 'activity', scopedId]);
      }
      void Taro.showToast({
        title: '组队帖已发布',
        icon: 'success',
      });
    },
    onExistingPost: () => {
      void Taro.showToast({
        title: '你已有组队帖，请去「我的」编辑或在活动详情查看',
        icon: 'none',
        duration: 2500,
      });
    },
    onMatchResults: handleMatchResults,
  });

  useEffect(() => {
    onMessageCountChange?.(messages.length);
  }, [messages.length, onMessageCountChange]);

  useEffect(() => {
    if (!initialMessage) {
      return;
    }
    if (initialMessageHandledRef.current) {
      return;
    }

    const trimmed = initialMessage.trim();
    if (!trimmed || isStreaming || aiMatchQuotaExhausted) return;

    initialMessageHandledRef.current = true;
    void send({ text: trimmed });
    onInitialMessageSent?.();
  }, [aiMatchQuotaExhausted, initialMessage, isStreaming, onInitialMessageSent, send]);

  const submit = useCallback(
    async (text: string, images?: string[]) => {
      if (submitLockRef.current) return;
      const trimmed = text.trim();
      const hasImages = images && images.length > 0;
      if ((!trimmed && !hasImages) || isStreaming) return;

      if (aiMatchQuotaExhausted) {
        void Taro.showToast({
          title: 'AI 匹配次数已用完，请升级套餐',
          icon: 'none',
        });
        return;
      }

      submitLockRef.current = true;
      try {
        setInput('');
        const localImages = images?.length ? [...images] : [];
        setPendingImages([]);
        const imageUrls =
          localImages.length > 0 ? await uploadChatImageRefs(localImages) : undefined;
        await send({
          text: trimmed,
          images: imageUrls?.length ? imageUrls : undefined,
        });
      } finally {
        submitLockRef.current = false;
      }
    },
    [aiMatchQuotaExhausted, isStreaming, send],
  );

  const handleClearChat = useCallback(async () => {
    if (isStreaming) return;
    await clearChat();
  }, [clearChat, isStreaming]);

  const handleSelectSuggestedReply = useCallback(
    async (reply: string) => {
      if (submitLockRef.current || isStreaming) return;
      if (aiMatchQuotaExhausted) {
        void Taro.showToast({
          title: 'AI 匹配次数已用完，请升级套餐',
          icon: 'none',
        });
        return;
      }
      submitLockRef.current = true;
      try {
        await send({ text: reply });
      } finally {
        submitLockRef.current = false;
      }
    },
    [aiMatchQuotaExhausted, isStreaming, send],
  );

  return (
    <View
      className="s-ai-assistant-chat"
      style={chatBodyHeight != null ? { height: `${chatBodyHeight}px` } : undefined}
    >
      {isLoadingHistory ? (
        <View className="s-ai-assistant__history-loading" aria-live="polite">
          <View className="s-ai-assistant__history-loading-bar" />
          <Text className="s-ai-assistant__history-loading-text">同步对话记录…</Text>
        </View>
      ) : null}
      <DegradedMatchBanner />
      <ChatMessageList
        messages={messages}
        isStreaming={isStreaming}
        keyboardInset={keyboardInset}
        userAvatar={userAvatar}
        userName={userName}
        userGender={userGender}
        onSelectSuggestedReply={handleSelectSuggestedReply}
      />
      <View
        className="s-ai-assistant-chat__footer"
        style={keyboardInset > 0 ? { paddingBottom: `${keyboardInset}px` } : undefined}
      >
        <ChatComposer
          input={input}
          pendingImages={pendingImages}
          isStreaming={isStreaming}
          isLoadingHistory={isLoadingHistory}
          activityLegacyId={activityLegacyId}
          activityTitle={activityTitle}
          onInputChange={setInput}
          onSubmit={submit}
          onPendingImagesChange={setPendingImages}
          onClearChat={handleClearChat}
          clearDisabled={isStreaming || isLoadingHistory}
        />
      </View>
    </View>
  );
}
