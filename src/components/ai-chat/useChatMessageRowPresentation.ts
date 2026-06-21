import type { ChatUiMessage } from '../../types/aiChat';
import type { AiGuidePlanFormValues } from '../../types/travelGuide';
import type { AiCapability } from '@/domains/ai-capability';
import { parsePublishConfirmMessage } from '../../utils/parsePublishConfirmMessage';
import {
  filterBuddyPostSheetShortcutReplies,
  isBuddyPostTemplatePrompt,
} from '../../utils/buddyPostPromptMessage';
import { isTravelGuideSheetPrompt } from '../../utils/travelGuidePromptMessage';
import { isItinerarySheetPrompt } from '../../utils/itineraryPromptMessage';
import { isPersonalityTestSheetPrompt } from '../../utils/personalityTestPromptMessage';
import {
  filterBoundSuggestedReplies,
  shouldSuppressPersonalityTestCta,
  shouldSuppressPlanSheetCtAs,
} from '../../utils/aiAssistantEntryPolicy';
import { useAiChatStore } from '../../stores/aiChatStore';
import {
  formatChatMessageTime,
  shouldShowChatMessageTimestamp,
} from './chatMessageRowTime';

type UseChatMessageRowPresentationOptions = {
  msg: ChatUiMessage;
  prevMsg?: ChatUiMessage;
  activityLegacyId?: number;
  festivalPlanHasItinerary?: boolean;
  onRunCapability?: (capability: AiCapability) => void;
  onOpenPersonalityTest?: () => void;
};

export function useChatMessageRowPresentation({
  msg,
  prevMsg,
  activityLegacyId,
  festivalPlanHasItinerary = false,
  onRunCapability,
  onOpenPersonalityTest,
}: UseChatMessageRowPresentationOptions) {
  const conversationFlow = useAiChatStore((state) =>
    state.activeScopeKey
      ? state.buckets[state.activeScopeKey]?.conversationState?.flow
      : undefined,
  );
  const suppressPlanSheetCtAs = shouldSuppressPlanSheetCtAs(
    activityLegacyId,
    conversationFlow,
  );
  const isUser = msg.from === 'user';
  const timestamp = formatChatMessageTime(msg.id);
  const showTimestamp = shouldShowChatMessageTimestamp(prevMsg, msg);

  const publishConfirm =
    !isUser && !msg.streaming ? parsePublishConfirmMessage(msg.text) : null;
  const hasPostCards = Boolean(msg.createdPost);
  const hasMatchedPosts = Boolean(msg.matchedPosts?.length);
  const hasActivityCard = Boolean(msg.recommendedActivity);
  const suggestedReplyChips =
    msg.isWelcome || msg.isPrepGuidance
      ? (msg.suggestedReplies ?? [])
      : (filterBoundSuggestedReplies(
          filterBuddyPostSheetShortcutReplies(msg.suggestedReplies),
          activityLegacyId,
          festivalPlanHasItinerary,
        ) ?? []);
  const hasSuggestedReplyChips = suggestedReplyChips.length > 0;
  const showBuddyPostTemplateCta =
    !suppressPlanSheetCtAs &&
    !isUser &&
    !msg.streaming &&
    Boolean(onRunCapability) &&
    (msg.showBuddyPostSheetCta || isBuddyPostTemplatePrompt(msg.text));
  const showTravelGuideSheetCta =
    !suppressPlanSheetCtAs &&
    !isUser &&
    !msg.streaming &&
    Boolean(onRunCapability) &&
    (msg.showTravelGuideSheetCta || isTravelGuideSheetPrompt(msg.text));
  const showItinerarySheetCta =
    !suppressPlanSheetCtAs &&
    !isUser &&
    !msg.streaming &&
    Boolean(onRunCapability) &&
    (msg.showItinerarySheetCta || isItinerarySheetPrompt(msg.text));
  const showPersonalityTestSheetCta =
    !shouldSuppressPersonalityTestCta(activityLegacyId) &&
    !isUser &&
    !msg.streaming &&
    Boolean(onOpenPersonalityTest) &&
    (msg.showPersonalityTestSheetCta || isPersonalityTestSheetPrompt(msg.text));
  const travelGuidePayload = msg.travelGuide;
  const hasTravelGuide = Boolean(travelGuidePayload?.plan && travelGuidePayload?.form);
  const itineraryPayload = msg.itinerary;
  const hasItinerary = Boolean(itineraryPayload?.result?.itinerary?.days?.length);
  const personalityPayload = msg.personalityResult;
  const hasPersonalityResult = Boolean(personalityPayload?.result);
  const showEmbedBelow =
    !isUser &&
    (hasPostCards ||
      hasMatchedPosts ||
      hasActivityCard ||
      hasSuggestedReplyChips ||
      showBuddyPostTemplateCta ||
      showTravelGuideSheetCta ||
      showItinerarySheetCta ||
      showPersonalityTestSheetCta ||
      hasTravelGuide ||
      hasItinerary ||
      hasPersonalityResult);
  const showPublishConfirm = Boolean(publishConfirm);
  const showProgressIndicator =
    !isUser &&
    msg.streaming &&
    Boolean(msg.progressKind) &&
    !hasPostCards &&
    !hasMatchedPosts &&
    !hasActivityCard &&
    !hasTravelGuide &&
    !hasItinerary &&
    !showPublishConfirm;
  const showTypingIndicator =
    msg.streaming &&
    !msg.text &&
    !msg.progressKind &&
    !hasPostCards &&
    !hasMatchedPosts &&
    !hasActivityCard &&
    !hasTravelGuide &&
    !showPublishConfirm;

  return {
    isUser,
    timestamp,
    showTimestamp,
    publishConfirm,
    suggestedReplyChips,
    hasSuggestedReplyChips,
    showBuddyPostTemplateCta,
    showTravelGuideSheetCta,
    showItinerarySheetCta,
    showPersonalityTestSheetCta,
    travelGuidePayload,
    hasTravelGuide,
    itineraryPayload,
    hasItinerary,
    personalityPayload,
    hasPersonalityResult,
    showEmbedBelow,
    showPublishConfirm,
    showProgressIndicator,
    showTypingIndicator,
    hasPostCards,
    hasMatchedPosts,
    hasActivityCard,
  };
}

export type ChatMessageRowPresentation = ReturnType<
  typeof useChatMessageRowPresentation
>;

export type ChatMessageRowCallbacks = {
  onSelectSuggestedReply: (reply: string) => void;
  onRegenerateTravelGuide?: (form: AiGuidePlanFormValues) => void;
  onBuddyPostFromTravelGuide?: (form: AiGuidePlanFormValues) => void;
  onRunCapability?: (capability: AiCapability) => void;
  onOpenPersonalityTest?: () => void;
};
