import type { ChatUiMessage } from '../types/aiChat';
import {
  BUDDY_POST_CTA,
  GENERATE_ITINERARY_CTA,
  GENERATE_TRAVEL_GUIDE_CTA,
  START_PERSONALITY_TEST_CTA,
} from '../constants/aiCtaLabels';
import { createMessageId } from '../hooks/ai-chat/createMessageId';
import { buildAiAssistantWelcomeText } from './aiAssistantWelcome';

export const LINEUP_CAPABILITY_LABEL = '查阵容';
export const TRAVEL_GUIDE_CAPABILITY_LABEL = GENERATE_TRAVEL_GUIDE_CTA;
export const ITINERARY_CAPABILITY_LABEL = GENERATE_ITINERARY_CTA;
export const BUDDY_POST_CAPABILITY_LABEL = BUDDY_POST_CTA;

export const PICK_FESTIVAL_CAPABILITY_LABEL = '选一场音乐节';
export const NEAR_EVENTS_CAPABILITY_LABEL = '最近有什么活动';
export const PERSONALITY_CAPABILITY_LABEL = START_PERSONALITY_TEST_CTA;

const NEAR_EVENTS_SUBMIT_TEXT = '查最近活动';

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
    return [LINEUP_CAPABILITY_LABEL];
  }
  return [
    PICK_FESTIVAL_CAPABILITY_LABEL,
    NEAR_EVENTS_CAPABILITY_LABEL,
    PERSONALITY_CAPABILITY_LABEL,
  ];
}

export function resolveWelcomeCapabilityChipAction(
  label: string,
  activityBound: boolean,
): WelcomeCapabilityChipAction | null {
  const trimmed = label.trim();
  if (!trimmed) return null;

  if (activityBound) {
    switch (trimmed) {
      case LINEUP_CAPABILITY_LABEL:
        return { type: 'send', text: '查阵容' };
      case TRAVEL_GUIDE_CAPABILITY_LABEL:
        return { type: 'travel_guide_sheet' };
      case ITINERARY_CAPABILITY_LABEL:
        return { type: 'itinerary_sheet' };
      case BUDDY_POST_CAPABILITY_LABEL:
        return { type: 'buddy_post_sheet' };
      default:
        return null;
    }
  }

  switch (trimmed) {
    case PICK_FESTIVAL_CAPABILITY_LABEL:
      return { type: 'pick_festival_sheet' };
    case NEAR_EVENTS_CAPABILITY_LABEL:
      return { type: 'send', text: NEAR_EVENTS_SUBMIT_TEXT };
    case PERSONALITY_CAPABILITY_LABEL:
      return { type: 'personality_test' };
    default:
      return null;
  }
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
