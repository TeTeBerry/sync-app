import { useCallback, useEffect, useMemo, useState } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { useDeferredMount } from '../../../hooks/useDeferredMount';
import { useNavBarInsets } from '../../../hooks/useNavBarInsets';
import { usePageRouteReady } from '../../../hooks/usePageRouteReady';
import { useEndRouteTransitionOnShow } from '../../../hooks/useEndRouteTransitionOnShow';
import { useTabPageMainHeight } from '../../../hooks/useTabPageMainHeight';
import { useResolvedProfile } from '../../../hooks/useResolvedProfile';
import { useActivityDetailQuery } from '../../../hooks/useSyncApi';
import {
  selectActiveActivityLegacyId,
  selectConsumeAiAssistantIntent,
  selectSetActiveActivityLegacyId,
  useNavigationStore,
} from '../../../stores';
import { goBack, goEventDetail, goProfileBenefits, ROUTES } from '../../../utils/route';
import { DEFER_AI_CHAT_MS } from '../../../utils/timing';
import { resolveAiChatWsUrl } from '../../../constants/api';
import { isAiChatWsDevLog } from '../../../utils/aiChatWs';
import { inferUserGenderFromName } from '../../../utils/inferAuthorGender';
import { useAiMatchQuota } from '../../../hooks/useAiMatchQuota';
import { useProfileActivityLegacyId } from '../../../hooks/useProfileActivityLegacyId';

/** Header content row (avatar + titles), excluding status bar. */
export const AI_HEADER_CONTENT_PX = 56;
/** Event context strip below header when scoped to an activity. */
export const AI_EVENT_CONTEXT_PX = 44;

export function useAiAssistantPage() {
  const navInsets = useNavBarInsets();
  const chatReady = useDeferredMount(DEFER_AI_CHAT_MS);
  const [navBoot] = useState(() => {
    const intent = useNavigationStore.getState().consumeAiAssistantIntent();
    if (intent?.activityLegacyId != null && !Number.isNaN(intent.activityLegacyId)) {
      useNavigationStore.getState().setActiveActivityLegacyId(intent.activityLegacyId);
    } else if (intent) {
      useNavigationStore.getState().setActiveActivityLegacyId(null);
    }
    return {
      initialMessage: intent?.initialMessage?.trim() ?? null,
      openAiGuideSheet: Boolean(intent?.openAiGuideSheet),
    };
  });
  const [pendingInitialMessage, setPendingInitialMessage] = useState(
    navBoot.initialMessage,
  );
  const [pendingOpenAiGuideSheet, setPendingOpenAiGuideSheet] = useState(
    navBoot.openAiGuideSheet,
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

  const consumeAiAssistantIntent = useNavigationStore(selectConsumeAiAssistantIntent);
  const activityLegacyId =
    useNavigationStore(selectActiveActivityLegacyId) ?? undefined;
  const setActiveActivityLegacyId = useNavigationStore(selectSetActiveActivityLegacyId);

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
    setPendingOpenAiGuideSheet(false);
  }, []);

  const applyAiAssistantIntent = useCallback(() => {
    const intent = consumeAiAssistantIntent();
    if (!intent) return;
    if (intent.initialMessage?.trim()) {
      setPendingInitialMessage(intent.initialMessage.trim());
    }
    if (intent.openAiGuideSheet) {
      setPendingOpenAiGuideSheet(true);
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

  return {
    navInsets,
    chatReady,
    pendingInitialMessage,
    pendingOpenAiGuideSheet,
    messageCount,
    setMessageCount,
    upgradeSheetOpen,
    setUpgradeSheetOpen,
    profileActivityLegacyId,
    aiMatchQuota,
    openUpgradeSheet,
    handleViewAllBenefits,
    profileUserData,
    userGender,
    activityQuery,
    activityTitle,
    activityMeta,
    hasEventScope,
    showEventContext,
    chatBodyHeight,
    activityLegacyId,
    handleInitialMessageSent,
    handleBack,
  };
}
