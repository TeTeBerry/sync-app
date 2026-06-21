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
import {
  FESTIVAL_PLAN_TASK_ORDER,
  type FestivalPlanTaskKey,
} from '@/domains/festival-plan/festivalPlanTaskDefs';
import { getFestivalPlanTaskDefs } from '@/domains/festival-plan/festivalPlanTaskLabels';

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
  | { type: 'lineup_page' }
  | { type: 'schedule_page' }
  | { type: 'personality_test' }
  | { type: 'pick_festival_sheet' };

export function isActivityBoundForCapabilities(
  activityLegacyId?: number | null,
): boolean {
  return activityLegacyId != null && !Number.isNaN(activityLegacyId);
}

export function festivalPlanTaskKeyFromActionLabel(
  label: string,
): FestivalPlanTaskKey | null {
  const trimmed = label.trim();
  if (!trimmed) return null;

  const defs = getFestivalPlanTaskDefs();
  for (const key of FESTIVAL_PLAN_TASK_ORDER) {
    if (trimmed === defs[key].actionLabel) {
      return key;
    }
  }

  if (labelMatchesKey(trimmed, 'ai.generateTravelGuide')) return 'travel_guide';
  if (labelMatchesKey(trimmed, 'ai.generateItinerary')) return 'itinerary';
  if (labelMatchesKey(trimmed, 'ai.buddyPost')) return 'buddy_post';

  return null;
}

function festivalPlanTaskKeyToChipAction(
  key: FestivalPlanTaskKey,
): WelcomeCapabilityChipAction {
  switch (key) {
    case 'travel_guide':
      return { type: 'travel_guide_sheet' };
    case 'itinerary':
      return { type: 'itinerary_sheet' };
    case 'buddy_post':
      return { type: 'buddy_post_sheet' };
  }
}

export function buildWelcomeCapabilityChipLabels(
  activityBound: boolean,
  nextTaskKey?: FestivalPlanTaskKey,
): string[] {
  if (activityBound) {
    const chips: string[] = [];
    if (nextTaskKey) {
      chips.push(getFestivalPlanTaskDefs()[nextTaskKey].actionLabel);
    }
    chips.push(getLineupCapabilityLabel());
    return chips;
  }
  return [getPickFestivalCapabilityLabel(), getNearEventsCapabilityLabel()];
}

export function resolveWelcomeCapabilityChipAction(
  label: string,
  activityBound: boolean,
): WelcomeCapabilityChipAction | null {
  const trimmed = label.trim();
  if (!trimmed) return null;

  if (activityBound) {
    if (labelMatchesKey(trimmed, 'ai.lineup') || trimmed === '查阵容') {
      return { type: 'lineup_page' };
    }
    if (labelMatchesKey(trimmed, 'ai.schedule') || trimmed === '演出表') {
      return { type: 'schedule_page' };
    }

    const taskKey = festivalPlanTaskKeyFromActionLabel(trimmed);
    if (taskKey) {
      return festivalPlanTaskKeyToChipAction(taskKey);
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
  nextTaskKey?: FestivalPlanTaskKey,
): ChatUiMessage {
  const activityBound = isActivityBoundForCapabilities(activityLegacyId);
  return {
    id: createMessageId(),
    from: 'ai',
    text: buildAiAssistantWelcomeText(activityTitle),
    isWelcome: true,
    suggestedReplies: buildWelcomeCapabilityChipLabels(activityBound, nextTaskKey),
  };
}
