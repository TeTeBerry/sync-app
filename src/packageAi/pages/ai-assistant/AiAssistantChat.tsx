import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Taro from '@tarojs/taro';
import { useAiChatStream } from '../../../hooks/useAiChatStream';
import { getAuthHeaders } from '../../../utils/authStorage';
import { invalidatePostQueries } from '../../../hooks/useSyncApi';
import { ChatMessageList } from '../../../components/ai-chat/ChatMessageList';
import { ChatComposer } from '../../../components/ai-chat/ChatComposer';
import { DegradedMatchBanner } from '../../../components/ai-chat/DegradedMatchBanner';
import { AiGuidePlanSheet } from '../../../components/ai-chat/AiGuidePlanSheet';
import { useKeyboardInset } from '../../../hooks/useKeyboardInset';
import { API_BASE_URL } from '../../../constants/api';
import { uploadChatImageRefs } from '../../../utils/chatImage';
import type { inferUserGenderFromName } from '../../../utils/inferAuthorGender';
import { Canvas, Text, View } from '@tarojs/components';
import { invalidateProfileEntitlements } from '../../../utils/queryInvalidation';
import { invalidateCache } from '../../../hooks/useApiQuery';
import { useAiTravelGuide } from '../../../hooks/useAiTravelGuide';
import { parseActivityDayCount } from '../../../utils/parseActivityDayCount';
import { useActivityDetailQuery } from '../../../hooks/useSyncApi';
import { TRAVEL_GUIDE_CANVAS_ID } from '../../../components/ai-chat/travelGuideWallpaper/renderTravelGuideImage';
import { isTravelGuideIntent } from '../../../utils/travelGuideIntent';
import { eventCityFromLocation } from '../../../utils/travelGuideDepartureSuggestions';
export type AiAssistantChatProps = {
  initialMessage?: string | null;
  initialOpenAiGuideSheet?: boolean;
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
  initialOpenAiGuideSheet = false,
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
  const initialGuideSheetHandledRef = useRef(false);
  const submitLockRef = useRef(false);

  const activityQuery = useActivityDetailQuery(activityLegacyId);
  const defaultGuideNights = useMemo(
    () => parseActivityDayCount(activityQuery.data?.date),
    [activityQuery.data?.date],
  );

  const guideEventCity = useMemo(
    () => eventCityFromLocation(activityQuery.data?.location),
    [activityQuery.data?.location],
  );

  const mockReply = useCallback(
    (query: string) =>
      `正在为你搜索「${query}」相关内容 🔍 已找到 ${Math.floor(Math.random() * 5 + 3)} 条相关信息。`,
    [],
  );

  const welcomeText = useMemo(() => {
    if (activityTitle?.trim()) {
      return `👋 已为你锁定「${activityTitle.trim()}」。可以说「帮我规划行程」生成出行攻略，或说说想找什么样的队友、住宿方式，我来帮你匹配或发帖。`;
    }
    return '👋 我是你的 AI 智能助手，帮你发现活动、找队友、规划行程，说出需求，我来搞定。';
  }, [activityTitle]);

  const handleMatchResults = useCallback(async () => {
    if (!API_BASE_URL) return;
    await invalidateProfileEntitlements();
  }, []);

  const {
    messages,
    setMessages,
    messagesRef,
    isStreaming,
    isLoadingHistory,
    isStreamingRef,
    send,
    clearChat,
  } = useAiChatStream({
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

  const travelGuide = useAiTravelGuide({
    activityLegacyId,
    activityTitle,
    defaultNights: defaultGuideNights,
    setMessages,
    messagesRef,
    isStreaming,
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
    onInitialMessageSent?.();

    const scoped =
      activityLegacyId != null && !Number.isNaN(activityLegacyId);
    if (isTravelGuideIntent(trimmed) && scoped) {
      travelGuide.openGuideSheetFromText(trimmed);
      return;
    }

    void send({ text: trimmed });
  }, [
    activityLegacyId,
    aiMatchQuotaExhausted,
    initialMessage,
    isStreaming,
    onInitialMessageSent,
    send,
    travelGuide,
  ]);

  useEffect(() => {
    if (!initialOpenAiGuideSheet || initialGuideSheetHandledRef.current) return;
    initialGuideSheetHandledRef.current = true;
    onInitialMessageSent?.();
    travelGuide.openGuideSheet();
  }, [initialOpenAiGuideSheet, onInitialMessageSent, travelGuide]);

  const submit = useCallback(
    async (text: string, images?: string[]) => {
      if (submitLockRef.current) return;
      const trimmed = text.trim();
      const hasImages = images && images.length > 0;
      if ((!trimmed && !hasImages) || isStreaming || isStreamingRef.current) {
        return;
      }

      if (aiMatchQuotaExhausted) {
        void Taro.showToast({
          title: 'AI 匹配次数已用完，请升级套餐',
          icon: 'none',
        });
        return;
      }

      const scoped =
        activityLegacyId != null && !Number.isNaN(activityLegacyId);
      if (
        scoped &&
        !hasImages &&
        isTravelGuideIntent(trimmed)
      ) {
        setInput('');
        setPendingImages([]);
        travelGuide.openGuideSheetFromText(trimmed);
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
    [activityLegacyId, aiMatchQuotaExhausted, isStreaming, isStreamingRef, send, travelGuide],
  );

  const handleClearChat = useCallback(async () => {
    if (isStreaming || isStreamingRef.current) return;
    await clearChat();
  }, [clearChat, isStreaming, isStreamingRef]);

  const handleSelectSuggestedReply = useCallback(
    async (reply: string) => {
      if (submitLockRef.current || isStreaming || isStreamingRef.current) return;
      if (aiMatchQuotaExhausted) {
        void Taro.showToast({
          title: 'AI 匹配次数已用完，请升级套餐',
          icon: 'none',
        });
        return;
      }
      const trimmed = reply.trim();
      const scoped =
        activityLegacyId != null && !Number.isNaN(activityLegacyId);
      if (scoped && isTravelGuideIntent(trimmed)) {
        travelGuide.openGuideSheetFromText(trimmed);
        return;
      }

      submitLockRef.current = true;
      try {
        await send({ text: trimmed });
      } finally {
        submitLockRef.current = false;
      }
    },
    [activityLegacyId, aiMatchQuotaExhausted, isStreaming, isStreamingRef, send, travelGuide],
  );

  return (
    <View
      className="s-ai-assistant-chat"
      style={chatBodyHeight != null ? { height: `${chatBodyHeight}px` } : undefined}
    >
      <Canvas
        type="2d"
        id={TRAVEL_GUIDE_CANVAS_ID}
        canvasId={TRAVEL_GUIDE_CANVAS_ID}
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '750px',
          height: '8192px',
          pointerEvents: 'none',
        }}
      />

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
        onRegenerateTravelGuide={travelGuide.handleRegenerate}
        onShareTravelGuide={(path) => void travelGuide.handleShareGuide(path)}
      />
      <View
        className="s-ai-assistant-chat__footer"
        style={keyboardInset > 0 ? { paddingBottom: `${keyboardInset}px` } : undefined}
      >
        <ChatComposer
          input={input}
          pendingImages={pendingImages}
          isStreaming={isStreaming || travelGuide.isGenerating}
          isLoadingHistory={isLoadingHistory}
          activityLegacyId={activityLegacyId}
          activityTitle={activityTitle}
          onInputChange={setInput}
          onSubmit={submit}
          onPendingImagesChange={setPendingImages}
          onClearChat={handleClearChat}
          clearDisabled={isStreaming || isLoadingHistory}
          onAiGuideClick={travelGuide.openGuideSheet}
        />
      </View>

      <AiGuidePlanSheet
        open={travelGuide.sheetOpen}
        defaultNights={travelGuide.defaultNights}
        eventCity={guideEventCity}
        initialValues={travelGuide.sheetInitialValues}
        onClose={() => travelGuide.setSheetOpen(false)}
        onSubmit={travelGuide.handleSheetSubmit}
      />
    </View>
  );
}
