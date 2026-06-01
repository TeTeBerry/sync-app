import './AiAssistantPage.scss';
import React, { type FC, useCallback, useEffect, useMemo, useState } from 'react';
import { BottomNavSlot } from './BottomNav';
import { CalendarDays, Sparkles, Zap } from 'lucide-react-taro';
import Taro, { useDidShow } from '@tarojs/taro';
import { invalidateCache } from '../hooks/useApiQuery';
import { useAiChatStream } from '../hooks/useAiChatStream';
import { getAuthHeaders } from '../utils/authStorage';
import { useResolvedProfile } from '../hooks/useResolvedProfile';
import { invalidatePostQueries, useActivityDetailQuery } from '../hooks/useSyncApi';
import { useNavigationStore } from '../stores';
import { goBack, goEventDetail, ROUTES } from '../utils/route';
import { ChatMessageList } from './ai-chat/ChatMessageList';
import { ChatComposer } from './ai-chat/ChatComposer';
import { DegradedMatchBanner } from './ai-chat/DegradedMatchBanner';
import { useDeferredMount } from '../hooks/useDeferredMount';
import { DEFER_AI_CHAT_MS } from '../utils/timing';
import { useNavBarInsets } from '../hooks/useNavBarInsets';
import { usePageRouteReady } from '../hooks/usePageRouteReady';
import { useEndRouteTransitionOnShow } from '../hooks/useEndRouteTransitionOnShow';
import PageNavigation from './PageNavigation';
import ThemedPageLoader from './ThemedPageLoader';
import { useTabPageMainHeight } from '../hooks/useTabPageMainHeight';
import { useKeyboardInset } from '../hooks/useKeyboardInset';
import { API_BASE_URL, resolveAiChatWsUrl } from '../constants/api';
import { isAiChatWsDevLog } from '../utils/aiChatWs';
import { uploadChatImageRefs } from '../utils/chatImage';
import { inferUserGenderFromName } from '../utils/inferAuthorGender';
import { Text, View } from '@tarojs/components';
import { AiUpgradeSheetProvider } from './ai-chat/AiUpgradeSheetContext';
import AiPackageUpgradeSheet from './ai-chat/AiPackageUpgradeSheet';
import { useAiMatchQuota } from '../hooks/useAiMatchQuota';
import { useProfileActivityLegacyId } from '../hooks/useProfileActivityLegacyId';
import { goProfileBenefits } from '../utils/route';
import { invalidateProfileEntitlements } from '../utils/queryInvalidation';

/** Header content row (avatar + titles), excluding status bar. */
const AI_HEADER_CONTENT_PX = 56;
/** Event context strip below header when scoped to an activity. */
const AI_EVENT_CONTEXT_PX = 44;

function AiAssistantChat({
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
}: {
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
}) {
  const [input, setInput] = useState('');
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const keyboardInset = useKeyboardInset();
  const initialMessageSentRef = React.useRef<string | null>(null);
  const initialMessageHandledRef = React.useRef(false);
  const submitLockRef = React.useRef(false);

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
    initialMessageSentRef.current = trimmed;
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

const AiAssistantPage: FC = () => {
  const navInsets = useNavBarInsets();
  const chatReady = useDeferredMount(DEFER_AI_CHAT_MS);
  const [pendingInitialMessage, setPendingInitialMessage] = useState<string | null>(
    () => {
      const intent = useNavigationStore.getState().consumeAiAssistantIntent();
      if (intent?.activityLegacyId != null && !Number.isNaN(intent.activityLegacyId)) {
        useNavigationStore
          .getState()
          .setActiveActivityLegacyId(intent.activityLegacyId);
      } else if (intent) {
        useNavigationStore.getState().setActiveActivityLegacyId(null);
      }
      return intent?.initialMessage?.trim() ?? null;
    },
  );
  const [messageCount, setMessageCount] = useState(0);
  const [upgradeSheetOpen, setUpgradeSheetOpen] = useState(false);
  const profileActivityLegacyId = useProfileActivityLegacyId();
  const aiMatchQuota = useAiMatchQuota();

  const openUpgradeSheet = useCallback(() => {
    setUpgradeSheetOpen(true);
  }, []);

  const handleViewAllBenefits = useCallback(() => {
    setUpgradeSheetOpen(false);
    Taro.nextTick(() => {
      goProfileBenefits();
    });
  }, []);

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
  const userGender = useMemo(
    () => inferUserGenderFromName(profileUserData.name),
    [profileUserData.name],
  );
  const activityQuery = useActivityDetailQuery(activityLegacyId);
  const activityTitle = activityQuery.data?.name;
  const activityMeta = useMemo(() => {
    if (!activityQuery.data) return '';
    return [activityQuery.data.date, activityQuery.data.location]
      .filter(Boolean)
      .join(' · ');
  }, [activityQuery.data]);

  const hasEventScope = activityLegacyId != null && !Number.isNaN(activityLegacyId);
  const showEventContext =
    hasEventScope && Boolean(activityTitle || activityQuery.isLoading);

  const headerSubtractPx = useMemo(() => {
    const eventBar = showEventContext ? AI_EVENT_CONTEXT_PX : 0;
    return navInsets.paddingTop + 12 + AI_HEADER_CONTENT_PX + eventBar;
  }, [navInsets.paddingTop, showEventContext]);

  const chatBodyHeight = useTabPageMainHeight({ subtractPx: headerSubtractPx });

  usePageRouteReady(true);
  useEndRouteTransitionOnShow();

  useEffect(() => {
    if (!isAiChatWsDevLog()) return;
    console.warn('[SYNC AI WS] AiAssistantPage mounted', {
      wsUrl: resolveAiChatWsUrl(),
      taroEnv: process.env.TARO_ENV,
      nodeEnv: process.env.NODE_ENV,
    });
  }, []);

  const handleInitialMessageSent = useCallback(() => {
    setPendingInitialMessage(null);
  }, []);

  const applyAiAssistantIntent = useCallback(() => {
    const intent = consumeAiAssistantIntent();
    if (!intent) return;
    if (intent.initialMessage?.trim()) {
      setPendingInitialMessage(intent.initialMessage.trim());
    }
    if (intent.activityLegacyId != null && !Number.isNaN(intent.activityLegacyId)) {
      setActiveActivityLegacyId(intent.activityLegacyId);
    } else {
      setActiveActivityLegacyId(null);
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
      <View
        className={[
          's-page-with-tabbar__main',
          's-ai-assistant',
          userGender === 'female' && 's-ai-assistant--female',
          userGender === 'male' && 's-ai-assistant--male',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <PageNavigation
          className="s-ai-assistant__header"
          tone="surface"
          centerAlign="start"
          onBack={handleBack}
          backAriaLabel={hasEventScope ? '返回活动详情' : '返回'}
          center={
            <View className="s-ai-assistant__header-main">
              <View className="s-ai-assistant__header-avatar" aria-hidden>
                <Sparkles size={18} />
                <Text className="s-ai-assistant__header-online" />
              </View>
              <View className="s-ai-assistant__header-text">
                {!hasEventScope ? (
                  <View className="s-ai-assistant__header-title-row">
                    <Text className="s-ai-assistant__header-title">AI 智能助手</Text>
                    <Text className="s-ai-assistant__ai-badge">
                      <Zap size={10} aria-hidden />
                      {'AI'}
                    </Text>
                  </View>
                ) : null}
                <Text className="s-ai-assistant__header-status">
                  {hasEventScope ? '正在对话' : '在线 · 实时响应'}
                </Text>
              </View>
            </View>
          }
          trailing={
            messageCount > 0 ? (
              <Text className="s-ai-assistant__message-count" aria-hidden>
                {messageCount}
              </Text>
            ) : undefined
          }
        />

        {showEventContext ? (
          <View className="s-ai-assistant__event-context">
            <View className="s-ai-assistant__event-context-icon" aria-hidden>
              <CalendarDays size={14} />
            </View>
            <View className="s-ai-assistant__event-context-text">
              {activityQuery.isLoading && !activityTitle ? (
                <Text className="s-ai-assistant__event-context-title">
                  加载活动信息…
                </Text>
              ) : (
                <>
                  <Text className="s-ai-assistant__event-context-kicker">当前活动</Text>
                  <Text className="s-ai-assistant__event-context-title">
                    {activityTitle ?? '本场活动'}
                  </Text>
                  {activityMeta ? (
                    <Text className="s-ai-assistant__event-context-meta">
                      {activityMeta}
                    </Text>
                  ) : null}
                </>
              )}
            </View>
          </View>
        ) : null}

        <View className="s-ai-assistant__body">
          <View className="s-ai-assistant__panel">
            {chatReady ? (
              <AiUpgradeSheetProvider openUpgradeSheet={openUpgradeSheet}>
                <AiAssistantChat
                  initialMessage={pendingInitialMessage}
                  activityLegacyId={activityLegacyId}
                  activityTitle={activityTitle}
                  onInitialMessageSent={handleInitialMessageSent}
                  onMessageCountChange={setMessageCount}
                  chatBodyHeight={chatBodyHeight}
                  userAvatar={profileUserData.avatar}
                  userName={profileUserData.name}
                  userGender={userGender}
                  aiMatchQuotaExhausted={aiMatchQuota.exhausted}
                />
              </AiUpgradeSheetProvider>
            ) : (
              <ThemedPageLoader
                variant="skeleton-ai-chat"
                className="s-ai-assistant__chat-skeleton"
                minHeight={chatBodyHeight ?? 320}
              />
            )}
          </View>
        </View>
      </View>

      <BottomNavSlot />

      <AiPackageUpgradeSheet
        open={upgradeSheetOpen}
        onClose={() => setUpgradeSheetOpen(false)}
        activityLegacyId={profileActivityLegacyId ?? activityLegacyId}
        onViewAllBenefits={handleViewAllBenefits}
      />
    </View>
  );
};

export default AiAssistantPage;
