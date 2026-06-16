import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Taro from '@tarojs/taro';
import { useAiChatStream } from '../../../hooks/useAiChatStream';
import { getAuthHeaders } from '../../../utils/authStorage';
import { invalidatePostQueries } from '../../../hooks/useSyncApi';
import { ChatMessageList } from '../../../components/ai-chat/ChatMessageList';
import { ChatComposer } from '../../../components/ai-chat/ChatComposer';
import { AccountRiskBanner } from '../../../components/account-risk/AccountRiskBanner';
import { useAccountRisk } from '../../../hooks/useAccountRisk';
import { AiBuddyPostSheet } from '../../../components/ai-chat/AiBuddyPostSheet';
import { AiGuidePlanSheet } from '../../../components/ai-chat/AiGuidePlanSheet';
import { useKeyboardInset } from '../../../hooks/useKeyboardInset';
import type { inferUserGenderFromName } from '../../../utils/inferAuthorGender';
import type { AiGuidePlanFormValues } from '../../../types/travelGuide';
import { Canvas, View } from '@tarojs/components';
import { invalidateCache } from '../../../hooks/useApiQuery';
import { useAiBuddyPost } from '../../../hooks/useAiBuddyPost';
import { useAiBuddySearchChat } from '../../../hooks/useAiBuddySearchChat';
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
  initialOpenBuddySearch?: boolean;
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
  initialOpenBuddySearch = false,
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
  const initialBuddySearchHandledRef = useRef(false);
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

  const handleBuddyPostPublished = useCallback(async () => {
    await invalidatePostQueries();
    if (activityLegacyId != null) {
      invalidateCache(['posts', 'activity', activityLegacyId]);
    }
  }, [activityLegacyId]);

  const buddyPost = useAiBuddyPost({
    activityLegacyId,
    activityTitle,
    activityDate: activityQuery.data?.date,
    authorName: userName,
    authorAvatar: userAvatar,
    setMessages,
    messagesRef,
    isStreaming,
    onPublished: handleBuddyPostPublished,
    onPlanningMessagesShown: scheduleScrollToBottom,
  });

  const buddySearch = useAiBuddySearchChat({
    activityLegacyId,
    activityTitle,
    setMessages,
    onMessagesUpdated: scheduleScrollToBottom,
  });

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

  useEffect(() => {
    if (!initialOpenBuddySearch || initialBuddySearchHandledRef.current) return;
    initialBuddySearchHandledRef.current = true;
    onInitialMessageSent?.();
    buddySearch.enterBuddySearchMode();
  }, [buddySearch.enterBuddySearchMode, initialOpenBuddySearch, onInitialMessageSent]);

  const submit = useCallback(
    async (text: string) => {
      if (submitLockRef.current) return;
      const trimmed = text.trim();
      if (
        !trimmed ||
        isStreaming ||
        isStreamingRef.current ||
        buddySearch.isSearching
      ) {
        return;
      }

      if (buddySearch.buddySearchActive) {
        submitLockRef.current = true;
        try {
          setInput('');
          await buddySearch.handleSearchSubmit(trimmed);
        } finally {
          submitLockRef.current = false;
        }
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
    [activityLegacyId, buddySearch, isStreaming, isStreamingRef, send, travelGuide],
  );

  const handleClearChat = useCallback(async () => {
    if (isStreaming || isStreamingRef.current || buddySearch.isSearching) return;
    buddySearch.exitBuddySearchMode();
    travelGuide.clearGuideCollect();
    await clearChat();
  }, [buddySearch, clearChat, isStreaming, isStreamingRef, travelGuide]);

  const handleSelectSuggestedReply = useCallback(
    async (reply: string) => {
      if (
        submitLockRef.current ||
        isStreaming ||
        isStreamingRef.current ||
        buddySearch.isSearching
      ) {
        return;
      }
      const trimmed = reply.trim();
      if (!trimmed) return;

      if (buddySearch.buddySearchActive) {
        submitLockRef.current = true;
        try {
          await buddySearch.handleSearchSubmit(trimmed);
        } finally {
          submitLockRef.current = false;
        }
        return;
      }

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
    [activityLegacyId, buddySearch, isStreaming, isStreamingRef, send, travelGuide],
  );

  const composerBusy =
    isStreaming ||
    travelGuide.isGenerating ||
    buddyPost.isPublishing ||
    buddySearch.isSearching;

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
        isStreaming={isStreaming || buddySearch.isSearching}
        isTravelGuideGenerating={travelGuide.isGenerating || buddyPost.isPublishing}
        scrollAreaHeight={chatScrollHeight}
        keyboardInset={keyboardInset}
        forceScrollToBottomKey={forceScrollToBottomKey}
        userAvatar={userAvatar}
        userName={userName}
        userGender={userGender}
        onSelectSuggestedReply={handleSelectSuggestedReply}
        onRegenerateTravelGuide={travelGuide.handleRegenerate}
        onShareTravelGuide={(path) => void travelGuide.handleShareGuide(path)}
        onBuddyPostFromTravelGuide={buddyPost.openBuddyPostSheetFromTravelGuide}
      />
      <View
        className="s-ai-assistant-chat__footer"
        style={keyboardInset > 0 ? { paddingBottom: `${keyboardInset}px` } : undefined}
      >
        <ChatComposer
          input={input}
          isStreaming={composerBusy}
          activityLegacyId={activityLegacyId}
          activityTitle={activityTitle}
          activityCode={activityQuery.data?.code}
          buddySearchMode={buddySearch.buddySearchActive}
          onInputChange={setInput}
          onSubmit={submit}
          onClearChat={handleClearChat}
          clearDisabled={composerBusy}
          onActivityChipClick={handleActivityChipClick}
        />
      </View>

      <AiBuddyPostSheet
        open={buddyPost.sheetOpen}
        activityDate={activityQuery.data?.date}
        activityTitle={activityTitle}
        eventCity={guideEventCity}
        initialValues={buddyPost.sheetInitialValues}
        prefillSummaryLines={buddyPost.sheetPrefillHint}
        onClose={buddyPost.closeBuddyPostSheet}
        onSubmit={buddyPost.handleSheetSubmit}
      />

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
