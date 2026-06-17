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
import type {
  AiGuidePlanFormValues,
  TravelGuidePlan,
} from '../../../types/travelGuide';
import { View } from '@tarojs/components';
import { invalidateCache } from '../../../hooks/useApiQuery';
import { useAiBuddyPost } from '../../../hooks/useAiBuddyPost';
import { useAiTravelGuide } from '../../../hooks/useAiTravelGuide';
import { saveTravelGuideDetail } from '../../../domains/travel-guide/utils/travelGuideDetailStorage';
import { resolveActivityByKeyword } from '../../../api/syncApi';
import {
  HOME_FESTIVAL_SHORTCUT_CHIPS,
  resolveActiveActivityChipKey,
} from '../../../constants/homeFestivalShortcuts';
import { selectSetActiveActivityLegacyId, useNavigationStore } from '../../../stores';
import { seedActivityDetailCache } from '../../../utils/activityDetailCache';
import {
  formatChatImagePickError,
  pickChatComposerImages,
  uploadChatComposerImages,
} from '../../../utils/chatComposerImages';
import {
  resolveWelcomeCapabilityChipAction,
  isActivityBoundForCapabilities,
} from '../../../utils/aiAssistantCapabilityDiscovery';
import { parseActivityDayCount } from '../../../utils/parseActivityDayCount';
import { useActivityDetailQuery } from '../../../hooks/useSyncApi';
import { eventCityFromLocation } from '../../../utils/travelGuideDepartureSuggestions';
import { shouldSuppressAutoScrollForMessage } from '../../../components/ai-chat/chatMessageListScroll';
import { BUDDY_POST_SHEET_ACTION_LABEL } from '../../../utils/buddyPostPromptMessage';
import { TRAVEL_GUIDE_SHEET_ACTION_LABEL } from '../../../utils/travelGuidePromptMessage';
import { goExclusiveItinerary, goPersonalityTest } from '../../../utils/route';
import { useItineraryStore } from '../../../domains/performance-itinerary/store';
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
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const keyboardInset = useKeyboardInset();
  const initialMessageHandledRef = useRef(false);
  const initialGuideSheetHandledRef = useRef(false);
  const initialAutoGuideHandledRef = useRef(false);
  const submitLockRef = useRef(false);
  const pendingPageShowScrollRef = useRef(false);
  const [forceScrollToBottomKey, setForceScrollToBottomKey] = useState(0);
  const [pinnedChipKey, setPinnedChipKey] = useState<string | undefined>();

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

  const {
    messages,
    setMessages,
    messagesRef,
    isStreaming,
    isStreamingRef,
    send,
    clearChat,
    applyActivityBinding,
    sessionIdRef,
  } = useAiChatStream({
    activityTitle,
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
    onTravelGuideReady: (event) => {
      if (activityLegacyId == null) return;
      saveTravelGuideDetail(event.guideId, {
        plan: event.plan as unknown as TravelGuidePlan,
        form: event.form,
        activityLegacyId,
      });
    },
    onItineraryReady: (event) => {
      useItineraryStore
        .getState()
        .setFromGenerateResult(event.activityLegacyId, event.selectedDjIds, {
          itinerary: {
            eventMeta: event.eventMeta,
            days: event.days,
          },
          conflicts: event.conflicts,
          cached: event.cached ?? false,
        });
    },
  });

  const handleOpenItinerarySheet = useCallback(() => {
    if (activityLegacyId == null) {
      void Taro.showToast({ title: '请先进入活动后再生成行程', icon: 'none' });
      return;
    }
    goExclusiveItinerary(activityLegacyId);
  }, [activityLegacyId]);

  const handleOpenPersonalityTest = useCallback(() => {
    goPersonalityTest();
  }, []);

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

  const activeChipKey = useMemo(() => {
    if (pinnedChipKey) {
      return pinnedChipKey;
    }
    return resolveActiveActivityChipKey({
      activityLegacyId,
      activityCode: activityQuery.data?.code,
      activityTitle: activityTitle?.trim(),
    });
  }, [activityLegacyId, activityQuery.data?.code, activityTitle, pinnedChipKey]);

  useEffect(() => {
    if (!pinnedChipKey) return;
    const resolved = resolveActiveActivityChipKey({
      activityLegacyId,
      activityCode: activityQuery.data?.code,
      activityTitle: activityTitle?.trim(),
    });
    if (resolved === pinnedChipKey) {
      setPinnedChipKey(undefined);
    }
  }, [activityLegacyId, activityQuery.data?.code, activityTitle, pinnedChipKey]);

  const handleActivityChipClick = useCallback(
    async (keyword: string) => {
      if (isStreaming || isStreamingRef.current) return;

      const trimmedKeyword = keyword.trim();
      if (!trimmedKeyword) return;

      const chip = HOME_FESTIVAL_SHORTCUT_CHIPS.find(
        (item) => item.submitText.toLowerCase() === trimmedKeyword.toLowerCase(),
      );
      if (chip) {
        setPinnedChipKey(chip.key);
      }

      try {
        const activity = await resolveActivityByKeyword(trimmedKeyword);
        if (activity?.legacyId != null && !Number.isNaN(activity.legacyId)) {
          const activityName = activity.name?.trim() || trimmedKeyword;
          seedActivityDetailCache(activity);
          setActiveActivityLegacyId(activity.legacyId);
          applyActivityBinding({ legacyId: activity.legacyId, name: activityName });
          setPinnedChipKey(
            resolveActiveActivityChipKey({
              activityLegacyId: activity.legacyId,
              activityCode: activity.code,
              activityTitle: activityName,
            }),
          );
          void Taro.showToast({
            title: `已绑定「${activityName}」`,
            icon: 'none',
          });
          return;
        }
      } catch {
        setPinnedChipKey(undefined);
        // fall through to unbound chat flow
      }

      setPinnedChipKey(undefined);

      await send({ text: trimmedKeyword });
    },
    [
      isStreaming,
      isStreamingRef,
      send,
      setActiveActivityLegacyId,
      applyActivityBinding,
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

    void send({ text: trimmed });
  }, [initialMessage, isStreaming, onInitialMessageSent, send]);

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
      const locals = pendingImages;
      const hasImages = locals.length > 0;
      if ((!trimmed && !hasImages) || isStreaming || isStreamingRef.current) {
        return;
      }

      submitLockRef.current = true;
      const previews = [...locals];
      try {
        setInput('');
        setPendingImages([]);

        let cloudRefs: string[] = [];
        if (previews.length > 0) {
          try {
            cloudRefs = await uploadChatComposerImages(previews);
          } catch (error) {
            setPendingImages(previews);
            void Taro.showToast({
              title: formatChatImagePickError(error),
              icon: 'none',
            });
            return;
          }
        }

        await send({
          text: trimmed,
          ...(cloudRefs.length === 1
            ? { image: cloudRefs[0], imagePreview: previews[0] }
            : cloudRefs.length > 1
              ? {
                  images: cloudRefs,
                  imagePreviews: previews,
                  imagePreview: previews[0],
                }
              : {}),
        });
      } finally {
        submitLockRef.current = false;
      }
    },
    [isStreaming, isStreamingRef, pendingImages, send],
  );

  const handlePickImages = useCallback(async () => {
    if (isStreaming || isStreamingRef.current) return;
    const picked = await pickChatComposerImages(pendingImages.length);
    if (!picked.length) return;
    setPendingImages((prev) => [...prev, ...picked]);
    bumpScrollToBottom();
  }, [bumpScrollToBottom, isStreaming, isStreamingRef, pendingImages.length]);

  const handleRemoveImage = useCallback((index: number) => {
    setPendingImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleClearChat = useCallback(async () => {
    if (isStreaming || isStreamingRef.current) return;
    setPendingImages([]);
    await clearChat();
  }, [clearChat, isStreaming, isStreamingRef]);

  const handleSelectSuggestedReply = useCallback(
    async (reply: string) => {
      if (submitLockRef.current || isStreaming || isStreamingRef.current) {
        return;
      }
      const trimmed = reply.trim();
      if (!trimmed) return;

      if (trimmed === BUDDY_POST_SHEET_ACTION_LABEL) {
        buddyPost.openBuddyPostSheetWithTag();
        return;
      }

      if (trimmed === TRAVEL_GUIDE_SHEET_ACTION_LABEL) {
        travelGuide.openGuideSheet();
        return;
      }

      const capabilityAction = resolveWelcomeCapabilityChipAction(
        trimmed,
        isActivityBoundForCapabilities(activityLegacyId),
      );
      if (capabilityAction) {
        switch (capabilityAction.type) {
          case 'send':
            submitLockRef.current = true;
            try {
              await send({ text: capabilityAction.text });
            } finally {
              submitLockRef.current = false;
            }
            return;
          case 'travel_guide_sheet':
            travelGuide.openGuideSheet();
            return;
          case 'itinerary_sheet':
            handleOpenItinerarySheet();
            return;
          case 'buddy_post_sheet':
            buddyPost.openBuddyPostSheetWithTag();
            return;
          case 'personality_test':
            handleOpenPersonalityTest();
            return;
          case 'pick_festival_hint':
            void Taro.showToast({
              title: '在下方选择活动名绑定场次',
              icon: 'none',
            });
            return;
        }
      }

      submitLockRef.current = true;
      try {
        await send({ text: trimmed });
      } finally {
        submitLockRef.current = false;
      }
    },
    [
      activityLegacyId,
      buddyPost,
      handleOpenItinerarySheet,
      handleOpenPersonalityTest,
      isStreaming,
      isStreamingRef,
      send,
      travelGuide,
    ],
  );

  const composerBusy =
    isStreaming || travelGuide.isGenerating || buddyPost.isPublishing;

  return (
    <View className="s-ai-assistant-chat">
      <AccountRiskBanner
        accountRisk={accountRisk}
        className="s-account-risk-banner--chat"
      />
      <ChatMessageList
        messages={messages}
        isStreaming={isStreaming}
        isTravelGuideGenerating={travelGuide.isGenerating || buddyPost.isPublishing}
        scrollAreaHeight={chatScrollHeight}
        keyboardInset={keyboardInset}
        forceScrollToBottomKey={forceScrollToBottomKey}
        userAvatar={userAvatar}
        userName={userName}
        userGender={userGender}
        onSelectSuggestedReply={handleSelectSuggestedReply}
        onRegenerateTravelGuide={travelGuide.handleRegenerate}
        onBuddyPostFromTravelGuide={buddyPost.openBuddyPostSheetFromTravelGuide}
        onOpenBuddyPostSheet={buddyPost.openBuddyPostSheetWithTag}
        onOpenTravelGuideSheet={travelGuide.openGuideSheet}
        onOpenItinerarySheet={handleOpenItinerarySheet}
        onOpenPersonalityTest={handleOpenPersonalityTest}
      />
      <View
        className="s-ai-assistant-chat__footer"
        style={keyboardInset > 0 ? { paddingBottom: `${keyboardInset}px` } : undefined}
      >
        <ChatComposer
          input={input}
          pendingImages={pendingImages}
          isStreaming={composerBusy}
          activityLegacyId={activityLegacyId}
          activityTitle={activityTitle}
          activityCode={activityQuery.data?.code}
          activeChipKey={activeChipKey}
          onInputChange={setInput}
          onSubmit={submit}
          onPickImages={handlePickImages}
          onRemoveImage={handleRemoveImage}
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
