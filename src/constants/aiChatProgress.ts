import { t } from '@/i18n';
import {
  getTravelGuideGeneratingStages,
  getTravelGuideGeneratingText,
} from './aiCtaLabels';

export type AiChatProgressKind =
  | 'thinking'
  | 'lineup'
  | 'activity'
  | 'travel_guide'
  | 'itinerary'
  | 'buddy_post'
  | 'dj_info';

function buildAiChatProgressStages(): Record<AiChatProgressKind, readonly string[]> {
  return {
    thinking: [t('ai.progressThinking0'), t('ai.progressThinking1')],
    lineup: [t('ai.progressLineup0'), t('ai.progressLineup1'), t('ai.progressLineup2')],
    activity: [t('ai.progressActivity0'), t('ai.progressActivity1')],
    travel_guide: [getTravelGuideGeneratingText(), ...getTravelGuideGeneratingStages()],
    itinerary: [
      t('ai.progressItinerary0'),
      t('ai.progressItinerary1'),
      t('ai.progressItinerary2'),
    ],
    buddy_post: [t('ai.progressBuddyPost0'), t('ai.progressBuddyPost1')],
    dj_info: [t('ai.progressDjInfo0'), t('ai.progressDjInfo1')],
  };
}

export function getAiChatProgressLabel(kind: AiChatProgressKind): string {
  return buildAiChatProgressStages()[kind][0];
}

export function getAiChatProgressStages(kind: AiChatProgressKind): readonly string[] {
  return buildAiChatProgressStages()[kind];
}

export const AI_CHAT_PROGRESS_STAGE_INTERVAL_MS = 3_500;
