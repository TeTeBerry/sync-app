import type { ChatUiMessage } from '../../types/aiChat';
import type { AiGuidePlanFormValues } from '../../types/travelGuide';
import type { AiCapability } from '@/domains/ai-capability';
import { AiAssistantActivityCard } from './AiAssistantActivityCard';
import { RecommendPostCards } from './RecommendPostCards';
import { SuggestedReplyChips } from './SuggestedReplyChips';
import { BuddyPostTemplateCta } from './BuddyPostTemplateCta';
import { TravelGuideSheetCta } from './TravelGuideSheetCta';
import { ItinerarySheetCta } from './ItinerarySheetCta';
import { PersonalityTestSheetCta } from './PersonalityTestSheetCta';
import { AiGuideResultCard } from './AiGuideResultCard';
import { AiItineraryResultCard } from './AiItineraryResultCard';
import { AiPersonalityResultCard } from './AiPersonalityResultCard';
import type { ChatMessageRowPresentation } from './useChatMessageRowPresentation';
import { View } from '@tarojs/components';

type ChatMessageEmbedProps = {
  msg: ChatUiMessage;
  presentation: ChatMessageRowPresentation;
  isStreaming: boolean;
  activityLegacyId?: number;
  onSelectSuggestedReply: (reply: string) => void;
  onRegenerateTravelGuide?: (form: AiGuidePlanFormValues) => void;
  onBuddyPostFromTravelGuide?: (form: AiGuidePlanFormValues) => void;
  onRunCapability?: (capability: AiCapability) => void;
  onOpenPersonalityTest?: () => void;
};

export function ChatMessageEmbed({
  msg,
  presentation,
  isStreaming,
  activityLegacyId,
  onSelectSuggestedReply,
  onRegenerateTravelGuide,
  onBuddyPostFromTravelGuide,
  onRunCapability,
  onOpenPersonalityTest,
}: ChatMessageEmbedProps) {
  const {
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
  } = presentation;

  return (
    <View className="s-ai-assistant-chat__embed">
      {msg.recommendedActivity ? (
        <AiAssistantActivityCard activity={msg.recommendedActivity} />
      ) : null}
      {msg.createdPost ? <RecommendPostCards posts={[msg.createdPost]} /> : null}
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
          onPress={() => onRunCapability!('buddy_post')}
          onOpenSheet={() => onRunCapability!('buddy_post')}
        />
      ) : null}
      {showTravelGuideSheetCta ? (
        <TravelGuideSheetCta
          disabled={isStreaming}
          onPress={() => onRunCapability!('travel_guide')}
          onOpenSheet={() => onRunCapability!('travel_guide')}
        />
      ) : null}
      {showItinerarySheetCta ? (
        <ItinerarySheetCta
          disabled={isStreaming}
          onPress={() => onRunCapability!('itinerary')}
          onOpenSheet={() => onRunCapability!('itinerary')}
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
          onRegenerate={() => onRegenerateTravelGuide?.(travelGuidePayload.form)}
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
  );
}
