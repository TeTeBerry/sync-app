import type { ChatUiMessage } from '../types/aiChat';
import {
  getBuddyPostCta,
  getGenerateItineraryCta,
  getGenerateTravelGuideCta,
  getStartPersonalityTestCta,
} from '../constants/aiCtaLabels';
import { createMessageId } from '../hooks/ai-chat/createMessageId';
import { buildAiAssistantWelcomeText } from './aiAssistantWelcome';
import { labelMatchesKey, t } from '@/i18n';

export function getLineupCapabilityLabel(): string {
  return t('ai.lineup');
}

export function getTravelGuideCapabilityLabel(): string {
  return getGenerateTravelGuideCta();
}

export function getItineraryCapabilityLabel(): string {
  return getGenerateItineraryCta();
}

export function getBuddyPostCapabilityLabel(): string {
  return getBuddyPostCta();
}

export function getPickFestivalCapabilityLabel(): string {
  return t('ai.pickFestival');
}

export function getNearEventsCapabilityLabel(): string {
  return t('ai.nearEvents');
}

export function getPersonalityCapabilityLabel(): string {
  return getStartPersonalityTestCta();
}

export type WelcomeCapabilityChipAction =
  | { type: 'send'; text: string }
  | { type: 'travel_guide_sheet' }
  | { type: 'itinerary_sheet' }
  | { type: 'buddy_post_sheet' }
  | { type: 'personality_test' }
  | { type: 'pick_festival_sheet' };

export function isActivityBoundForCapabilities(
  activityLegacyId?: number | null,
): boolean {
  return activityLegacyId != null && !Number.isNaN(activityLegacyId);
}

export function buildWelcomeCapabilityChipLabels(activityBound: boolean): string[] {
  if (activityBound) {
    return [getLineupCapabilityLabel()];
  }
  return [
    getPickFestivalCapabilityLabel(),
    getNearEventsCapabilityLabel(),
    getPersonalityCapabilityLabel(),
  ];
}

export function resolveWelcomeCapabilityChipAction(
  label: string,
  activityBound: boolean,
): WelcomeCapabilityChipAction | null {
  const trimmed = label.trim();
  if (!trimmed) return null;

  if (activityBound) {
    if (labelMatchesKey(trimmed, 'ai.lineup') || trimmed === '查阵容') {
      return { type: 'send', text: t('ai.lineup') };
    }
    if (labelMatchesKey(trimmed, 'ai.generateTravelGuide')) {
      return { type: 'travel_guide_sheet' };
    }
    if (labelMatchesKey(trimmed, 'ai.generateItinerary')) {
      return { type: 'itinerary_sheet' };
    }
    if (labelMatchesKey(trimmed, 'ai.buddyPost')) {
      return { type: 'buddy_post_sheet' };
    }
    return null;
  }

  if (labelMatchesKey(trimmed, 'ai.pickFestival')) {
    return { type: 'pick_festival_sheet' };
  }
  if (labelMatchesKey(trimmed, 'ai.nearEvents')) {
    return { type: 'send', text: t('ai.nearEventsSubmit') };
  }
  if (labelMatchesKey(trimmed, 'ai.startPersonalityTest')) {
    return { type: 'personality_test' };
  }

  return null;
}

export function createWelcomeChatMessage(
  activityTitle?: string,
  activityLegacyId?: number,
): ChatUiMessage {
  const activityBound = isActivityBoundForCapabilities(activityLegacyId);
  return {
    id: createMessageId(),
    from: 'ai',
    text: buildAiAssistantWelcomeText(activityTitle),
    isWelcome: true,
    suggestedReplies: buildWelcomeCapabilityChipLabels(activityBound),
  };
}
