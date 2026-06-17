import type { AiChatProgressKind } from '../constants/aiChatProgress';

export function resolveAiChatProgressKind(input: { text: string }): AiChatProgressKind {
  const trimmed = input.text.trim();
  if (!trimmed) {
    return 'thinking';
  }

  const lower = trimmed.toLowerCase();

  if (/查阵容|^阵容$|艺人名单|lineup/.test(trimmed) || /lineup/.test(lower)) {
    return 'lineup';
  }

  if (/查最近活动|最近有什么活动|有什么活动/.test(trimmed)) {
    return 'activity';
  }

  if (/生成.*攻略|出行攻略/.test(trimmed)) {
    return 'travel_guide';
  }

  if (/专属行程|生成.*行程/.test(trimmed)) {
    return 'itinerary';
  }

  if (/组队|发帖|找搭子|拼房|拼车/.test(trimmed)) {
    return 'buddy_post';
  }

  if (
    /\bdj\b|艺人|曲风|techno|house|trance|hardstyle|阵容里|谁演|演出表/.test(
      lower + trimmed,
    )
  ) {
    return 'dj_info';
  }

  return 'thinking';
}
