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
    thinking: ['思考中…', '正在理解你的问题…'],
    lineup: ['正在查阵容…', '正在整理艺人名单…', '正在匹配曲风标签…'],
    activity: ['正在查活动…', '正在检索近期场次…'],
    travel_guide: [getTravelGuideGeneratingText(), ...getTravelGuideGeneratingStages()],
    itinerary: ['正在生成专属行程…', '正在分析你的偏好…', '正在排演出时段…'],
    buddy_post: ['正在发布组队帖…', '正在同步到活动页…'],
    dj_info: ['正在查询艺人信息…', '正在检索代表作与风格…'],
  };
}

export function getAiChatProgressLabel(kind: AiChatProgressKind): string {
  return buildAiChatProgressStages()[kind][0];
}

export function getAiChatProgressStages(kind: AiChatProgressKind): readonly string[] {
  return buildAiChatProgressStages()[kind];
}

export const AI_CHAT_PROGRESS_STAGE_INTERVAL_MS = 3_500;
