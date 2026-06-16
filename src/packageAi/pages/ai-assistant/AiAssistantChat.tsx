import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Taro from '@tarojs/taro';
import { useAiChatStream } from '../../../hooks/useAiChatStream';
import { getAuthHeaders } from '../../../utils/authStorage';
import { ChatMessageList } from '../../../components/ai-chat/ChatMessageList';
import { ChatComposer } from '../../../components/ai-chat/ChatComposer';
import { AccountRiskBanner } from '../../../components/account-risk/AccountRiskBanner';
import { useAccountRisk } from '../../../hooks/useAccountRisk';
import { AiGuidePlanSheet } from '../../../components/ai-chat/AiGuidePlanSheet';
import { useKeyboardInset } from '../../../hooks/useKeyboardInset';
import type { inferUserGenderFromName } from '../../../utils/inferAuthorGender';
import type { AiGuidePlanFormValues } from '../../../types/travelGuide';
import { Canvas, View } from '@tarojs/components';
import { useAiTravelGuide } from '../../../hooks/useAiTravelGuide';
import { resolveActivityByKeyword } from '../../../api/syncApi';
import { selectSetActiveActivityLegacyId, useNavigationStore } from '../../../stores';
import { parseActivityDayCount } from '../../../utils/parseActivityDayCount';
import { useActivityDetailQuery } from '../../../hooks/useSyncApi';
import { TRAVEL_GUIDE_CANVAS_ID } from '../../../components/ai-chat/travelGuideWallpaper/renderTravelGuideImage';
import { TRAVEL_GUIDE_MAX_CANVAS_HEIGHT } from '../../../components/ai-chat/travelGuideWallpaper/renderTravelGuideImage';
import { eventCityFromLocation } from '../../../utils/travelGuideDepartureSuggestions';
import { shouldSuppressAutoScrollForMessage } from '../../../components/ai-chat/chatMessageListScroll';
import { isOffscreenCanvasSupported } from '../../../utils/offscreenCanvas';
export type AiAssistantChatProps = {
  initialMessage?: string | null;
  initialOpenAiGuideSheet?: boolean;
  initialAutoRunTravelGuideForm?: AiGuidePlanFormValues | null;
  activityLegacyId?: number;
  activityTitle?: string;
  onInitialMessageSent?: () => void;
  /** Increments on each page useDidShow — drives scroll-to-bottom after return. */
  pageShowSeq?: number;
  onMessageCountChange?: (count: number) => void;
  /** Explicit ScrollView height — required on WeChat when disableScroll is true. */
  chatScrollHeight?: number;
  userAvatar?: string;
  userName: string;
  userGender?: ReturnType<typeof inferUserGenderFromName>;
};

export function AiAssistantChat({
  initialMessage,
  initialOpenAiGuideSheet = false,
  initialAutoRunTravelGuideForm = null,
  activityLegacyId,
  activityTitle,
  onInitialMessageSent,
  pageShowSeq = 0,
  onMessageCountChange,
  chatScrollHeight,
  userAvatar,
  userName,
  userGender,
}: AiAssistantChatProps) {
  const [input, setInput] = useState('');
  const keyboardInset = useKeyboardInset();
  const initialMessageHandledRef = useRef(false);
  const initialGuideSheetHandledRef = useRef(false);
  const initialAutoGuideHandledRef = useRef(false);
  const prevInitialMessageRef = useRef<string | null>(null);
  const prevOpenGuideSheetRef = useRef(false);
  const prevAutoGuideFormRef = useRef<AiGuidePlanFormValues | null>(null);
  const submitLockRef = useRef(false);
  const pendingPageShowScrollRef = useRef(false);
  const [forceScrollToBottomKey, setForceScrollToBottomKey] = useState(0);

  const bumpScrollToBottom = useCallback(() => {
    setForceScrollToBottomKey((k) => k + 1);
  }, []);

  const activityQuery = useActivityDetailQuery(activityLegacyId);
  const { accountRisk } = useAccountRisk();
  const defaultGuideNights = useMemo(
    () => parseActivityDayCount(activityQuery.data?.date),
    [activityQuery.data?.date],
  );

  const guideEventCity = useMemo(
    () => eventCityFromLocation(activityQuery.data?.location),
    [activityQuery.data?.location],
  );

  const trimmedActivityTitle = activityTitle?.trim();

  const welcomeText = useMemo(() => {
    if (activityTitle?.trim()) {
      return `👋 已为你锁定「${activityTitle.trim()}」。有问题随时问我，或点下方活动名切换场次。`;
    }
    return '👋 我是你的 AI 智能助手，帮你发现活动、规划出行。点下方活动名绑定场次。';
  }, [activityTitle]);

  const {
    messages,
    setMessages,
    messagesRef,
    isStreaming,
    isStreamingRef,
    send,
    clearChat,
    sessionIdRef,
  } = useAiChatStream({
    welcomeText,
    streamErrorText: '抱歉，回复出错了，请稍后再试。',
    activityLegacyId,
    getAuthHeaders,
  });

  const scheduleScrollToBottom = useCallback(() => {
    const last = messagesRef.current[messagesRef.current.length - 1];
    if (shouldSuppressAutoScrollForMessage(last)) return;
    bumpScrollToBottom();
    setTimeout(() => {
      const latest = messagesRef.current[messagesRef.current.length - 1];
      if (shouldSuppressAutoScrollForMessage(latest)) return;
      bumpScrollToBottom();
    }, 100);
    setTimeout(() => {
      const latest = messagesRef.current[messagesRef.current.length - 1];
      if (shouldSuppressAutoScrollForMessage(latest)) return;
      bumpScrollToBottom();
    }, 300);
  }, [bumpScrollToBottom, messagesRef]);

  const travelGuide = useAiTravelGuide({
    activityLegacyId,
    activityTitle,
    defaultNights: defaultGuideNights,
    setMessages,
    messagesRef,
    isStreaming,
    sessionIdRef,
    onPlanningMessagesShown: scheduleScrollToBottom,
  });

  const setActiveActivityLegacyId = useNavigationStore(selectSetActiveActivityLegacyId);

  const handleActivityChipClick = useCallback(
    async (keyword: string) => {
      if (isStreaming || isStreamingRef.current) return;

      const trimmedKeyword = keyword.trim();
      if (!trimmedKeyword) return;

      try {
        const activity = await resolveActivityByKeyword(trimmedKeyword);
        if (activity?.legacyId != null && !Number.isNaN(activity.legacyId)) {
          setActiveActivityLegacyId(activity.legacyId);
          void Taro.showToast({
            title: `已绑定「${activity.name?.trim() || trimmedKeyword}」`,
            icon: 'none',
          });
          return;
        }
      } catch {
        // fall through to unbound chat flow
      }

      const scoped = activityLegacyId != null && !Number.isNaN(activityLegacyId);
      if (scoped) {
        const guideHandled =
          await travelGuide.handleTravelGuideChatMessage(trimmedKeyword);
        if (guideHandled) return;
      }
      await send({ text: trimmedKeyword });
    },
    [
      activityLegacyId,
      isStreaming,
      isStreamingRef,
      send,
      setActiveActivityLegacyId,
      travelGuide,
    ],
  );

  useEffect(() => {
    onMessageCountChange?.(messages.length);
  }, [messages.length, onMessageCountChange]);

  useEffect(() => {
    if (pageShowSeq === 0) return;
    pendingPageShowScrollRef.current = true;
  }, [pageShowSeq]);

  useEffect(() => {
    if (!pendingPageShowScrollRef.current) return;
    if (messages.length === 0) return;
    pendingPageShowScrollRef.current = false;
    scheduleScrollToBottom();
  }, [messages.length, pageShowSeq, scheduleScrollToBottom]);

  useEffect(() => {
    const trimmed = initialMessage?.trim() || null;
    if (trimmed && prevInitialMessageRef.current == null) {
      initialMessageHandledRef.current = false;
    }
    prevInitialMessageRef.current = trimmed;
  }, [initialMessage]);

  useEffect(() => {
    if (initialOpenAiGuideSheet && !prevOpenGuideSheetRef.current) {
      initialGuideSheetHandledRef.current = false;
    }
    prevOpenGuideSheetRef.current = initialOpenAiGuideSheet;
  }, [initialOpenAiGuideSheet]);

  useEffect(() => {
    const form = initialAutoRunTravelGuideForm;
    if (form != null && prevAutoGuideFormRef.current == null) {
      initialAutoGuideHandledRef.current = false;
    }
    prevAutoGuideFormRef.current = form ?? null;
  }, [initialAutoRunTravelGuideForm]);

  useEffect(() => {
    if (!initialMessage) {
      return;
    }
    if (initialMessageHandledRef.current) {
      return;
    }

    const trimmed = initialMessage.trim();
    if (!trimmed || isStreaming) return;

    initialMessageHandledRef.current = true;
    onInitialMessageSent?.();

    const scoped = activityLegacyId != null && !Number.isNaN(activityLegacyId);
    void (async () => {
      if (scoped) {
        const guideHandled = await travelGuide.handleTravelGuideChatMessage(trimmed);
        if (guideHandled) return;
      }
      await send({ text: trimmed });
    })();
  }, [
    activityLegacyId,
    initialMessage,
    isStreaming,
    onInitialMessageSent,
    send,
    travelGuide,
  ]);

  useEffect(() => {
    if (!initialOpenAiGuideSheet || initialGuideSheetHandledRef.current) return;
    if (activityLegacyId == null || Number.isNaN(activityLegacyId)) return;
    initialGuideSheetHandledRef.current = true;
    onInitialMessageSent?.();
    travelGuide.openGuideSheet();
  }, [activityLegacyId, initialOpenAiGuideSheet, onInitialMessageSent, travelGuide]);

  useEffect(() => {
    const form = initialAutoRunTravelGuideForm;
    if (!form || initialAutoGuideHandledRef.current) return;
    if (activityLegacyId == null || Number.isNaN(activityLegacyId)) return;
    initialAutoGuideHandledRef.current = true;
    onInitialMessageSent?.();
    Taro.nextTick(() => {
      travelGuide.handleSheetSubmit(form);
    });
  }, [
    activityLegacyId,
    initialAutoRunTravelGuideForm,
    onInitialMessageSent,
    travelGuide,
  ]);

  const submit = useCallback(
    async (text: string) => {
      if (submitLockRef.current) return;
      const trimmed = text.trim();
      if (!trimmed || isStreaming || isStreamingRef.current) {
        return;
      }

      const scoped = activityLegacyId != null && !Number.isNaN(activityLegacyId);
      if (scoped) {
        const guideHandled = await travelGuide.handleTravelGuideChatMessage(trimmed);
        if (guideHandled) {
          setInput('');
          return;
        }
      }

      submitLockRef.current = true;
      try {
        setInput('');
        await send({ text: trimmed });
      } finally {
        submitLockRef.current = false;
      }
    },
    [activityLegacyId, isStreaming, isStreamingRef, send, travelGuide],
  );

  const handleClearChat = useCallback(async () => {
    if (isStreaming || isStreamingRef.current) return;
    travelGuide.clearGuideCollect();
    await clearChat();
  }, [clearChat, isStreaming, isStreamingRef, travelGuide]);

  const handleSelectSuggestedReply = useCallback(
    async (reply: string) => {
      if (submitLockRef.current || isStreaming || isStreamingRef.current) return;
      const trimmed = reply.trim();
      const scoped = activityLegacyId != null && !Number.isNaN(activityLegacyId);
      if (scoped) {
        const guideHandled = await travelGuide.handleTravelGuideChatMessage(trimmed);
        if (guideHandled) return;
      }

      submitLockRef.current = true;
      try {
        await send({ text: trimmed });
      } finally {
        submitLockRef.current = false;
      }
    },
    [activityLegacyId, isStreaming, isStreamingRef, send, travelGuide],
  );

  const needsPageGuideCanvas =
    !isOffscreenCanvasSupported() && travelGuide.isGenerating;

  return (
    <View className="s-ai-assistant-chat">
      {needsPageGuideCanvas ? (
        <Canvas
          type="2d"
          id={TRAVEL_GUIDE_CANVAS_ID}
          canvasId={TRAVEL_GUIDE_CANVAS_ID}
          style={{
            position: 'fixed',
            left: '-9999px',
            top: 0,
            width: '750px',
            height: `${TRAVEL_GUIDE_MAX_CANVAS_HEIGHT}px`,
            pointerEvents: 'none',
          }}
        />
      ) : null}

      <AccountRiskBanner
        accountRisk={accountRisk}
        className="s-account-risk-banner--chat"
      />
      <ChatMessageList
        messages={messages}
        isStreaming={isStreaming}
        isTravelGuideGenerating={travelGuide.isGenerating}
        scrollAreaHeight={chatScrollHeight}
        keyboardInset={keyboardInset}
        forceScrollToBottomKey={forceScrollToBottomKey}
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
          isStreaming={isStreaming || travelGuide.isGenerating}
          activityLegacyId={activityLegacyId}
          activityTitle={activityTitle}
          activityCode={activityQuery.data?.code}
          onInputChange={setInput}
          onSubmit={submit}
          onClearChat={handleClearChat}
          clearDisabled={isStreaming}
          onActivityChipClick={handleActivityChipClick}
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
