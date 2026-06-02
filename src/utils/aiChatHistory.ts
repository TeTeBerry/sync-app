import type { AiChatMessage } from '../types/aiChat';

/** 单轮请求：仅发送当前用户输入，不带历史上下文。 */
export function buildSingleTurnUserMessage(
  text: string,
  image?: string,
): AiChatMessage[] {
  const trimmed = text.trim();
  const source = image?.trim();
  if (!trimmed && !source) {
    return [];
  }
  return [
    {
      role: 'user',
      content: trimmed,
      ...(source ? { imageContext: { source } } : {}),
    },
  ];
}
