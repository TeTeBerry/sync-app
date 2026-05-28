import "./AiAssistantPage.scss";
import React, { type FC, useCallback, useEffect, useState } from "react";
import { BottomNavSlot } from "./BottomNav";
import { ChevronLeft, Sparkles, Trash2, Zap,  } from "lucide-react-taro";
import Taro, { useDidShow } from "@tarojs/taro";
import { invalidateCache } from "../hooks/useApiQuery";
import { useAiChatStream } from "../hooks/useAiChatStream";
import { useResolvedProfile } from "../hooks/useResolvedProfile";
import { invalidatePostQueries } from "../hooks/useSyncApi";
import { useNavigationStore } from "../stores";
import { goBack, goEventDetail, ROUTES } from "../utils/route";
import { ChatMessageList } from "./ai-chat/ChatMessageList";
import { ChatComposer } from "./ai-chat/ChatComposer";
import { DegradedMatchBanner } from "./ai-chat/DegradedMatchBanner";
import { useDeferredMount } from "../hooks/useDeferredMount";
import { DEFER_AI_CHAT_MS } from "../utils/timing";
import { usePageRouteReady } from "../hooks/usePageRouteReady";
import { useTabPageMainHeight } from "../hooks/useTabPageMainHeight";
import { Button, Text, View } from "@tarojs/components";

/** Header row below status bar (px, matches AiAssistantPage.scss). */
const AI_HEADER_PX = 100;

function AiAssistantChat({
  initialMessage,
  activityLegacyId,
  onInitialMessageSent,
  onClearReady,
  onMessageCountChange,
  chatBodyHeight,
  userAvatar,
  userName,
}: {
  initialMessage?: string | null;
  activityLegacyId?: number;
  onInitialMessageSent?: () => void;
  onClearReady?: (clear: () => Promise<void>, isBusy: boolean) => void;
  onMessageCountChange?: (count: number) => void;
  chatBodyHeight?: number;
  userAvatar?: string;
  userName: string;
}) {
  const [input, setInput] = useState("");
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const initialMessageSentRef = React.useRef<string | null>(null);
  const initialMessageHandledRef = React.useRef(false);
  const submitLockRef = React.useRef(false);

  const mockReply = useCallback(
    (query: string) =>
      `正在为你搜索「${query}」相关内容 🔍 已找到 ${Math.floor(Math.random() * 5 + 3)} 条相关信息。`,
    [],
  );

  const { messages, isStreaming, isLoadingHistory, send, clearChat } =
    useAiChatStream({
      welcomeText: "👋 我是你的 AI 智能助手，帮你发现活动、找队友、规划行程，说出需求，我来搞定。",
      mockReply,
      streamErrorText: "抱歉，回复出错了，请稍后再试。",
      activityLegacyId,
      onPostCreated: async (event) => {
        await invalidatePostQueries();
        const scopedId = event.activityLegacyId ?? activityLegacyId;
        if (scopedId != null) {
          invalidateCache(["posts", "activity", scopedId]);
        }
        void Taro.showToast({
          title: "组队帖已发布",
          icon: "success",
        });
      },
      onExistingPost: () => {
        void Taro.showToast({
          title: "你已有组队帖，请去「我的」编辑或在活动详情查看",
          icon: "none",
          duration: 2500,
        });
      },
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
    if (!trimmed || isLoadingHistory || isStreaming) return;

    initialMessageHandledRef.current = true;
    initialMessageSentRef.current = trimmed;
    void send({ text: trimmed });
    onInitialMessageSent?.();
  }, [initialMessage, isLoadingHistory, isStreaming, onInitialMessageSent, send]);

  const submit = useCallback(
    async (text: string, images?: string[]) => {
      if (submitLockRef.current) return;
      const trimmed = text.trim();
      const hasImages = images && images.length> 0;
      if ((!trimmed && !hasImages) || isStreaming || isLoadingHistory) return;

      submitLockRef.current = true;
      try {
        setInput("");
        setPendingImages([]);
        await send({ text: trimmed, images: images?.length ? images : undefined });
      } finally {
        submitLockRef.current = false;
      }
    },
    [isLoadingHistory, isStreaming, send],
  );

  const handleClearChat = useCallback(async () => {
    if (isStreaming) return;
    await clearChat();
  }, [clearChat, isStreaming]);

  useEffect(() => {
    onClearReady?.(handleClearChat, isStreaming || isLoadingHistory);
  }, [handleClearChat, isLoadingHistory, isStreaming, onClearReady]);

  const handleSelectSuggestedReply = useCallback(
    async (reply: string) => {
      if (submitLockRef.current || isStreaming) return;
      submitLockRef.current = true;
      try {
        await send({ text: reply });
      } finally {
        submitLockRef.current = false;
      }
    },
    [isStreaming, send],
  );

  return (
    <View
      className="s-ai-assistant-chat"
      style={chatBodyHeight != null ? { height: `${chatBodyHeight}px` } : undefined}>
      {isLoadingHistory ? (
        <Text className="s-ai-assistant__hint">加载中…</Text>
      ) : null}
      <DegradedMatchBanner />
      <ChatMessageList
        messages={messages}
        isStreaming={isStreaming}
        userAvatar={userAvatar}
        userName={userName}
        onSelectSuggestedReply={handleSelectSuggestedReply}
      />
      <View className="s-ai-assistant-chat__footer">
        <ChatComposer
          input={input}
          pendingImages={pendingImages}
          isStreaming={isStreaming}
          isLoadingHistory={isLoadingHistory}
          activityLegacyId={activityLegacyId}
          onInputChange={setInput}
          onSubmit={submit}
          onPendingImagesChange={setPendingImages}
        />
      </View>
    </View>
  );
}

const AiAssistantPage: FC = () => {
  const chatReady = useDeferredMount(DEFER_AI_CHAT_MS);
  const [pendingInitialMessage, setPendingInitialMessage] = useState<
    string | null
>(null);
  const [clearChatFn, setClearChatFn] = useState<(() => Promise<void>) | null>(
    null,
  );
  const [clearBusy, setClearBusy] = useState(false);
  const [messageCount, setMessageCount] = useState(0);

  const consumeAiAssistantIntent = useNavigationStore(
    (state) => state.consumeAiAssistantIntent,
  );
  const activityLegacyId = useNavigationStore(
    (state) => state.activeActivityLegacyId ?? undefined,
  );
  const setActiveActivityLegacyId = useNavigationStore(
    (state) => state.setActiveActivityLegacyId,
  );

  const profileUserData = useResolvedProfile();
  const chatBodyHeight = useTabPageMainHeight({ subtractPx: AI_HEADER_PX });

  usePageRouteReady(true);

  const handleClearReady = useCallback(
    (clear: () => Promise<void>, isBusy: boolean) => {
      setClearChatFn(() => clear);
      setClearBusy(isBusy);
    },
    [],
  );

  const handleInitialMessageSent = useCallback(() => {
    setPendingInitialMessage(null);
  }, []);

  const applyAiAssistantIntent = useCallback(() => {
    const intent = consumeAiAssistantIntent();
    if (intent?.initialMessage?.trim()) {
      setPendingInitialMessage(intent.initialMessage.trim());
    }
    if (intent?.activityLegacyId != null && !Number.isNaN(intent.activityLegacyId)) {
      setActiveActivityLegacyId(intent.activityLegacyId);
    }
  }, [consumeAiAssistantIntent, setActiveActivityLegacyId]);

  useEffect(() => {
    applyAiAssistantIntent();
  }, [applyAiAssistantIntent]);

  useDidShow(applyAiAssistantIntent);

  const handleBack = useCallback(() => {
    const pages = Taro.getCurrentPages();
    if (pages.length <= 1) {
      if (activityLegacyId != null && !Number.isNaN(activityLegacyId)) {
        goEventDetail(activityLegacyId);
        return;
      }
      goBack(ROUTES.HOME);
      return;
    }
    goBack();
  }, [activityLegacyId]);

  return (
    <View data-cmp="AiAssistant" className="s-page-with-tabbar">
      <View className="s-page-with-tabbar__main s-ai-assistant">
        <View className="s-ai-assistant__header">
        <Button className="s-ai-assistant__back-btn"
          onClick={handleBack}>
          <ChevronLeft size={22} />
        </Button>

        <View className="s-ai-assistant__header-main">
          <View className="s-ai-assistant__header-avatar" aria-hidden>
            <Sparkles size={18} />
            <Text className="s-ai-assistant__header-online" />
          </View>
          <View className="s-ai-assistant__header-text">
            <View className="s-ai-assistant__header-title-row">
              <Text className="s-ai-assistant__header-title">
                {"AI 智能助手"}
              </Text>
              <Text className="s-ai-assistant__ai-badge">
                <Zap size={10} aria-hidden />
                {"AI"}
              </Text>
            </View>
            <Text className="s-ai-assistant__header-status">
              {"在线 · 实时响应"}
            </Text>
          </View>
        </View>

        <View className="s-ai-assistant__header-actions">
          {messageCount> 0 ? (
            <Text className="s-ai-assistant__message-count" aria-hidden>
              {messageCount}
            </Text>
          ) : null}
          <Button className="s-ai-assistant__clear-btn"
            disabled={clearBusy || !clearChatFn}
            aria-label="清空对话"
            onClick={() => void clearChatFn?.()}>
            <Trash2 size={16} />
          </Button>
        </View>
        </View>

        <View className="s-ai-assistant__body">
          <View className="s-ai-assistant__panel">
            {chatReady ? (
              <AiAssistantChat
                initialMessage={pendingInitialMessage}
                activityLegacyId={activityLegacyId}
                onInitialMessageSent={handleInitialMessageSent}
                onClearReady={handleClearReady}
                onMessageCountChange={setMessageCount}
                chatBodyHeight={chatBodyHeight}
                userAvatar={profileUserData.avatar}
                userName={profileUserData.name}
              />
            ) : (
              <View className="s-ai-assistant__chat-placeholder" aria-hidden />
            )}
          </View>
        </View>
      </View>

      <BottomNavSlot />
    </View>
  );
};

export default AiAssistantPage;
