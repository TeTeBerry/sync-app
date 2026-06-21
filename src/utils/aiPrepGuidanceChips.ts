import type { FestivalPlanTaskKey } from '@/domains/festival-plan/festivalPlanTaskDefs';
import type { ChatUiMessage } from '@/types/aiChat';
import {
  buildWelcomeCapabilityChipLabels,
  isActivityBoundForCapabilities,
} from './aiAssistantCapabilityDiscovery';

export function buildPrepGuidanceChipLabels(
  activityLegacyId?: number,
  nextTaskKey?: FestivalPlanTaskKey,
): string[] {
  return buildWelcomeCapabilityChipLabels(
    isActivityBoundForCapabilities(activityLegacyId),
    nextTaskKey,
  );
}

function messageHasRichEmbed(message: ChatUiMessage): boolean {
  return Boolean(
    message.travelGuide ||
    message.itinerary ||
    message.personalityResult ||
    message.createdPost ||
    message.matchedPosts?.length ||
    message.recommendedActivity ||
    message.registeredActivity ||
    message.showTravelGuideSheetCta ||
    message.showBuddyPostSheetCta ||
    message.showItinerarySheetCta ||
    message.showPersonalityTestSheetCta,
  );
}

export function shouldAttachPrepGuidanceChips(message: ChatUiMessage): boolean {
  if (!message.isPrepGuidance) return false;
  if (message.suggestedReplies?.length) return false;
  if (message.isWelcome) return false;
  if (message.streaming) return false;
  if (messageHasRichEmbed(message)) return false;
  return true;
}

export function withPrepGuidanceChips(
  message: ChatUiMessage,
  activityLegacyId?: number,
  nextTaskKey?: FestivalPlanTaskKey,
): ChatUiMessage {
  if (!shouldAttachPrepGuidanceChips(message)) {
    return message;
  }

  const suggestedReplies = buildPrepGuidanceChipLabels(activityLegacyId, nextTaskKey);
  if (!suggestedReplies.length) {
    return message;
  }

  return {
    ...message,
    suggestedReplies,
  };
}
