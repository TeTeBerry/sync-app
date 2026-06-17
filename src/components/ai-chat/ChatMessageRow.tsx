import { memo } from 'react';
import { Sparkles } from '../../components/icons';
import { cn } from '../ui';
import type { ChatUiMessage } from '../../types/aiChat';
import type { AiGuidePlanFormValues } from '../../types/travelGuide';
import type { AuthorGender } from '../../utils/inferAuthorGender';
import { ChatUserAvatar } from './ChatUserAvatar';
import { AiAssistantActivityCard } from './AiAssistantActivityCard';
import { RecommendPostCards } from './RecommendPostCards';
import { PublishConfirmCard } from './PublishConfirmCard';
import { SuggestedReplyChips } from './SuggestedReplyChips';
import { BuddyPostTemplateCta } from './BuddyPostTemplateCta';
import { TravelGuideSheetCta } from './TravelGuideSheetCta';
import { ItinerarySheetCta } from './ItinerarySheetCta';
import { PersonalityTestSheetCta } from './PersonalityTestSheetCta';
import { AiGuideResultCard } from './AiGuideResultCard';
import { AiItineraryResultCard } from './AiItineraryResultCard';
import { AiPersonalityResultCard } from './AiPersonalityResultCard';
import { parsePublishConfirmMessage } from '../../utils/parsePublishConfirmMessage';
import {
  filterBuddyPostSheetShortcutReplies,
  isBuddyPostTemplatePrompt,
} from '../../utils/buddyPostPromptMessage';
import { isTravelGuideSheetPrompt } from '../../utils/travelGuidePromptMessage';
import { isItinerarySheetPrompt } from '../../utils/itineraryPromptMessage';
import { isPersonalityTestSheetPrompt } from '../../utils/personalityTestPromptMessage';
import {
  filterChecklistDuplicateSuggestedReplies,
  shouldSuppressPlanSheetCtAs,
} from '../../utils/aiAssistantEntryPolicy';
import { useAiChatStore } from '../../stores/aiChatStore';
import { AiChatProgressIndicator } from './AiChatProgressIndicator';
import { Text, View } from '@tarojs/components';

const TIMESTAMP_GAP_MS = 5 * 60 * 1000;

function messageTimestampMs(id: string): number | null {
  const ts = Number(id.split('-')[0]);
  if (!Number.isFinite(ts) || ts <= 0) return null;
  return ts;
}

function formatMessageTime(id: string): string | null {
  const ts = messageTimestampMs(id);
  if (ts == null) return null;
  const date = new Date(ts);
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function shouldShowTimestamp(messages: ChatUiMessage[], index: number): boolean {
  if (index === 0) return true;
  const currentTs = messageTimestampMs(messages[index].id);
  const previousTs = messageTimestampMs(messages[index - 1].id);
  if (currentTs == null || previousTs == null) {
    return messages[index].from !== messages[index - 1].from;
  }
  return currentTs - previousTs >= TIMESTAMP_GAP_MS;
}

export type ChatMessageRowProps = {
  msg: ChatUiMessage;
  index: number;
  messages: ChatUiMessage[];
  isStreaming: boolean;
  activityLegacyId?: number;
  userAvatar?: string;
  userName: string;
  userGender?: AuthorGender;
  onSelectSuggestedReply: (reply: string) => void;
  onRegenerateTravelGuide?: (form: AiGuidePlanFormValues) => void;
  onBuddyPostFromTravelGuide?: (form: AiGuidePlanFormValues) => void;
  onOpenBuddyPostSheet?: () => void;
  onOpenTravelGuideSheet?: () => void;
  onOpenItinerarySheet?: () => void;
  onOpenPersonalityTest?: () => void;
};

function ChatMessageRowInner({
  msg,
  index,
  messages,
  isStreaming,
  activityLegacyId,
  userAvatar,
  userName,
  userGender,
  onSelectSuggestedReply,
  onRegenerateTravelGuide,
  onBuddyPostFromTravelGuide,
  onOpenBuddyPostSheet,
  onOpenTravelGuideSheet,
  onOpenItinerarySheet,
  onOpenPersonalityTest,
}: ChatMessageRowProps) {
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
  const timestamp = formatMessageTime(msg.id);
  const showTimestamp = shouldShowTimestamp(messages, index);

  const publishConfirm =
    !isUser && !msg.streaming ? parsePublishConfirmMessage(msg.text) : null;
  const hasPostCards = Boolean(msg.createdPost);
  const hasMatchedPosts = Boolean(msg.matchedPosts?.length);
  const hasActivityCard = Boolean(msg.recommendedActivity);
  const suggestedReplyChips = msg.isWelcome
    ? (msg.suggestedReplies ?? [])
    : (filterChecklistDuplicateSuggestedReplies(
        filterBuddyPostSheetShortcutReplies(msg.suggestedReplies),
        activityLegacyId,
      ) ?? []);
  const hasSuggestedReplyChips = suggestedReplyChips.length > 0;
  const showBuddyPostTemplateCta =
    !suppressPlanSheetCtAs &&
    !isUser &&
    !msg.streaming &&
    Boolean(onOpenBuddyPostSheet) &&
    (msg.showBuddyPostSheetCta || isBuddyPostTemplatePrompt(msg.text));
  const showTravelGuideSheetCta =
    !suppressPlanSheetCtAs &&
    !isUser &&
    !msg.streaming &&
    Boolean(onOpenTravelGuideSheet) &&
    (msg.showTravelGuideSheetCta || isTravelGuideSheetPrompt(msg.text));
  const showItinerarySheetCta =
    !suppressPlanSheetCtAs &&
    !isUser &&
    !msg.streaming &&
    Boolean(onOpenItinerarySheet) &&
    (msg.showItinerarySheetCta || isItinerarySheetPrompt(msg.text));
  const showPersonalityTestSheetCta =
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

  return (
    <>
      {showTimestamp && timestamp ? (
        <Text className="s-ai-assistant-chat__timestamp">{timestamp}</Text>
      ) : null}
      <View
        id={`chat-msg-${msg.id}`}
        className={cn(
          's-ai-assistant-chat__row',
          isUser && 's-ai-assistant-chat__row--from-user',
        )}
      >
        {!isUser ? (
          <View className="s-ai-assistant-chat__avatar s-ai-assistant-chat__avatar--ai">
            <Sparkles size={14} />
          </View>
        ) : null}
        <View
          className={cn(
            's-ai-assistant-chat__content',
            isUser && 's-ai-assistant-chat__content--from-user',
            (hasPostCards || hasActivityCard || showPublishConfirm) &&
              's-ai-assistant-chat__content--has-cards',
          )}
        >
          <View
            className={cn(
              's-ai-assistant-chat__bubble',
              isUser
                ? cn(
                    's-ai-assistant-chat__bubble--from-user',
                    userGender === 'female' &&
                      's-ai-assistant-chat__bubble--from-user--female',
                    userGender === 'male' &&
                      's-ai-assistant-chat__bubble--from-user--male',
                  )
                : 's-ai-assistant-chat__bubble--from-ai',
              msg.streaming && 's-ai-assistant-chat__bubble--streaming',
              msg.streaming &&
                (showProgressIndicator || showTypingIndicator) &&
                's-ai-assistant-chat__bubble--waiting',
              showEmbedBelow && 's-ai-assistant-chat__bubble--with-embed-below',
              showPublishConfirm && 's-ai-assistant-chat__bubble--publish-confirm',
            )}
          >
            {showProgressIndicator && msg.progressKind ? (
              <AiChatProgressIndicator kind={msg.progressKind} label={msg.text} />
            ) : showTypingIndicator ? (
              <View className="s-ai-assistant-chat__typing" aria-label="AI 正在思考">
                <View className="s-ai-assistant-chat__typing-dot" />
                <View className="s-ai-assistant-chat__typing-dot" />
                <View className="s-ai-assistant-chat__typing-dot" />
              </View>
            ) : (
              <>
                {publishConfirm ? (
                  <PublishConfirmCard
                    payload={publishConfirm}
                    userAvatar={userAvatar}
                    userName={userName}
                  />
                ) : msg.text ? (
                  <Text className="s-ai-assistant-chat__bubble-text">{msg.text}</Text>
                ) : null}
                {isUser && hasSuggestedReplyChips ? (
                  <SuggestedReplyChips
                    replies={suggestedReplyChips}
                    disabled={isStreaming}
                    onSelect={onSelectSuggestedReply}
                  />
                ) : null}
              </>
            )}
          </View>
          {showEmbedBelow ? (
            <View className="s-ai-assistant-chat__embed">
              {msg.recommendedActivity ? (
                <AiAssistantActivityCard activity={msg.recommendedActivity} />
              ) : null}
              {msg.createdPost ? (
                <RecommendPostCards posts={[msg.createdPost]} />
              ) : null}
              {msg.matchedPosts?.length ? (
                <RecommendPostCards posts={msg.matchedPosts} />
              ) : null}
              {hasSuggestedReplyChips ? (
                <SuggestedReplyChips
                  replies={suggestedReplyChips}
                  disabled={isStreaming}
                  onSelect={onSelectSuggestedReply}
                />
              ) : null}
              {showBuddyPostTemplateCta ? (
                <BuddyPostTemplateCta
                  disabled={isStreaming}
                  onOpenSheet={onOpenBuddyPostSheet!}
                />
              ) : null}
              {showTravelGuideSheetCta ? (
                <TravelGuideSheetCta
                  disabled={isStreaming}
                  onOpenSheet={onOpenTravelGuideSheet!}
                />
              ) : null}
              {showItinerarySheetCta ? (
                <ItinerarySheetCta
                  disabled={isStreaming}
                  onOpenSheet={onOpenItinerarySheet!}
                />
              ) : null}
              {showPersonalityTestSheetCta ? (
                <PersonalityTestSheetCta
                  disabled={isStreaming}
                  onOpenSheet={onOpenPersonalityTest!}
                />
              ) : null}
              {hasTravelGuide && travelGuidePayload ? (
                <AiGuideResultCard
                  guideId={travelGuidePayload.guideId || msg.id}
                  plan={travelGuidePayload.plan}
                  form={travelGuidePayload.form}
                  activityLegacyId={activityLegacyId}
                  disabled={isStreaming}
                  onRegenerate={() =>
                    onRegenerateTravelGuide?.(travelGuidePayload.form)
                  }
                  onBuddyPostFromGuide={
                    onBuddyPostFromTravelGuide
                      ? () => onBuddyPostFromTravelGuide(travelGuidePayload.form)
                      : undefined
                  }
                />
              ) : null}
              {hasItinerary && itineraryPayload ? (
                <AiItineraryResultCard
                  activityLegacyId={itineraryPayload.activityLegacyId}
                  selectedDjIds={itineraryPayload.selectedDjIds}
                  result={itineraryPayload.result}
                  disabled={isStreaming}
                />
              ) : null}
              {hasPersonalityResult && personalityPayload ? (
                <AiPersonalityResultCard
                  result={personalityPayload.result}
                  disabled={isStreaming}
                />
              ) : null}
            </View>
          ) : null}
        </View>
        {isUser ? (
          <ChatUserAvatar avatar={userAvatar} name={userName} userGender={userGender} />
        ) : null}
      </View>
    </>
  );
}

export const ChatMessageRow = memo(ChatMessageRowInner);
