import './AiAssistantPage.scss';
import { type FC, useCallback, useEffect, useMemo, useState } from 'react';
import { BottomNavSlot } from '../../../components/navigation/BottomNav';
import { CalendarDays, Sparkles, Zap } from 'lucide-react-taro';
import Taro, { useDidShow } from '@tarojs/taro';
import { useResolvedProfile } from '../../../hooks/useResolvedProfile';
import { useActivityDetailQuery } from '../../../hooks/useSyncApi';
import { useNavigationStore } from '../../../stores';
import { goBack, goEventDetail, ROUTES } from '../../../utils/route';
import { useDeferredMount } from '../../../hooks/useDeferredMount';
import { DEFER_AI_CHAT_MS } from '../../../utils/timing';
import { useNavBarInsets } from '../../../hooks/useNavBarInsets';
import { usePageRouteReady } from '../../../hooks/usePageRouteReady';
import { useEndRouteTransitionOnShow } from '../../../hooks/useEndRouteTransitionOnShow';
import PageNavigation from '../../../components/navigation/PageNavigation';
import ThemedPageLoader from '../../../components/ThemedPageLoader';
import { useTabPageMainHeight } from '../../../hooks/useTabPageMainHeight';
import { resolveAiChatWsUrl } from '../../../constants/api';
import { isAiChatWsDevLog } from '../../../utils/aiChatWs';
import { inferUserGenderFromName } from '../../../utils/inferAuthorGender';
import { Text, View } from '@tarojs/components';
import { AiUpgradeSheetProvider } from '../../../components/ai-chat/AiUpgradeSheetContext';
import AiPackageUpgradeSheet from '../../../components/ai-chat/AiPackageUpgradeSheet';
import { useAiMatchQuota } from '../../../hooks/useAiMatchQuota';
import { useProfileActivityLegacyId } from '../../../hooks/useProfileActivityLegacyId';
import { goProfileBenefits } from '../../../utils/route';
import { AiAssistantChat } from './AiAssistantChat';

/** Header content row (avatar + titles), excluding status bar. */
const AI_HEADER_CONTENT_PX = 56;
/** Event context strip below header when scoped to an activity. */
const AI_EVENT_CONTEXT_PX = 44;

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
