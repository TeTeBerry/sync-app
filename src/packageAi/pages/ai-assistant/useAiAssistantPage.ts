import { useCallback, useEffect, useMemo, useState } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { useNavBarInsets } from '../../../hooks/useNavBarInsets';
import { usePageRouteReady } from '../../../hooks/usePageRouteReady';
import { useResolvedProfile } from '../../../hooks/useResolvedProfile';
import { useActivityDetailQuery } from '../../../hooks/useSyncApi';
import {
  selectActiveActivityLegacyId,
  selectConsumeAiAssistantIntent,
  useNavigationStore,
} from '../../../stores';
import { bindActivity, clearActivityScope } from '../../../domains/activity-scope';
import { resolveAiChatWsUrl } from '../../../constants/api';
import { isAiChatWsDevLog } from '../../../utils/aiChatWs';
import { inferUserGenderFromName } from '../../../utils/inferAuthorGender';
import { useFestivalPlanSummary } from '../../../domains/festival-plan/useFestivalPlanSummary';
import { useFestivalPlanNavigation } from '../../../domains/festival-plan/useFestivalPlanNavigation';
import type { FestivalPlanTaskActions } from '../../../domains/festival-plan/festivalPlanTaskActions';
import type { ActivityBindingActions } from './activityBindingActions';

export function useAiAssistantPage() {
  const navInsets = useNavBarInsets();
  const [navBoot] = useState(() => {
    const intent = useNavigationStore.getState().consumeAiAssistantIntent();
    if (intent?.activityLegacyId != null && !Number.isNaN(intent.activityLegacyId)) {
      bindActivity(intent.activityLegacyId);
    } else if (intent) {
      clearActivityScope();
    }
    return {
      initialMessage: intent?.initialMessage?.trim() ?? null,
      openAiGuideSheet: Boolean(intent?.openAiGuideSheet),
      prefillTravelGuideForm: intent?.prefillTravelGuideForm ?? null,
      autoRunTravelGuideForm: intent?.autoRunTravelGuideForm ?? null,
    };
  });
  const [pendingInitialMessage, setPendingInitialMessage] = useState(
    navBoot.initialMessage,
  );
  const [pendingOpenAiGuideSheet, setPendingOpenAiGuideSheet] = useState(
    navBoot.openAiGuideSheet,
  );
  const [pendingPrefillGuideForm, setPendingPrefillGuideForm] = useState(
    navBoot.prefillTravelGuideForm,
  );
  const [pendingAutoGuideForm, setPendingAutoGuideForm] = useState(
    navBoot.autoRunTravelGuideForm,
  );
  const [chatRevision, setChatRevision] = useState(0);
  const [pageShowSeq, setPageShowSeq] = useState(0);
  const [chromeLayoutSeq, setChromeLayoutSeq] = useState(0);
  const [festivalPlanActions, setFestivalPlanActions] =
    useState<FestivalPlanTaskActions | null>(null);
  const [activityBindingActions, setActivityBindingActions] =
    useState<ActivityBindingActions | null>(null);

  const consumeAiAssistantIntent = useNavigationStore(selectConsumeAiAssistantIntent);
  const activityLegacyId =
    useNavigationStore(selectActiveActivityLegacyId) ?? undefined;

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
  const festivalPlan = useFestivalPlanSummary(
    activityLegacyId,
    pageShowSeq + chatRevision,
  );
  const handleFestivalPlanTaskPress = useFestivalPlanNavigation(
    activityLegacyId,
    festivalPlan,
    festivalPlanActions,
  );

  const layoutRemeasureKey = useMemo(
    () => `${showEventContext ? 1 : 0}:${chromeLayoutSeq}`,
    [chromeLayoutSeq, showEventContext],
  );

  const handleChromeLayoutChange = useCallback(() => {
    setChromeLayoutSeq((seq) => seq + 1);
  }, []);

  usePageRouteReady(true);

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
    setPendingPrefillGuideForm(null);
    setPendingAutoGuideForm(null);
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
    if (intent.prefillTravelGuideForm) {
      setPendingPrefillGuideForm(intent.prefillTravelGuideForm);
    }
    if (intent.autoRunTravelGuideForm) {
      setPendingAutoGuideForm(intent.autoRunTravelGuideForm);
    }
    if (intent.activityLegacyId != null && !Number.isNaN(intent.activityLegacyId)) {
      bindActivity(intent.activityLegacyId);
    } else {
      clearActivityScope();
    }
  }, [consumeAiAssistantIntent]);

  useEffect(() => {
    applyAiAssistantIntent();
  }, [applyAiAssistantIntent]);

  useDidShow(() => {
    applyAiAssistantIntent();
    setPageShowSeq((n) => n + 1);
  });

  return {
    navInsets,
    pendingInitialMessage,
    pendingOpenAiGuideSheet,
    pendingPrefillGuideForm,
    pendingAutoGuideForm,
    pageShowSeq,
    onChatMessagesChange: setChatRevision,
    profileUserData,
    userGender,
    activityQuery,
    activityTitle,
    activityMeta,
    showEventContext,
    festivalPlan,
    handleFestivalPlanTaskPress,
    setFestivalPlanActions,
    activityBindingActions,
    setActivityBindingActions,
    layoutRemeasureKey,
    handleChromeLayoutChange,
    activityLegacyId,
    handleInitialMessageSent,
  };
}
