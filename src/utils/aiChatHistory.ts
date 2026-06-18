import type { AiChatMessage, ChatUiMessage } from '../types/aiChat';

/** Align with backend `CHAT_LLM_CONTEXT_TURNS`. */
export const CHAT_LLM_CONTEXT_TURNS = 6;

function truncateToRecentTurns(
  messages: AiChatMessage[],
  maxTurns: number,
): AiChatMessage[] {
  if (!messages.length || maxTurns <= 0) return messages;

  const turns: AiChatMessage[][] = [];
  let current: AiChatMessage[] = [];

  for (const message of messages) {
    if (message.role === 'user') {
      if (current.length) turns.push(current);
      current = [message];
      continue;
    }
    if (current.length) current.push(message);
  }
  if (current.length) turns.push(current);

  return turns
    .slice(-maxTurns)
    .reduce<AiChatMessage[]>((acc, turn) => acc.concat(turn), []);
}

function mapUiMessageToLlmMessage(message: ChatUiMessage): AiChatMessage | null {
  if (message.streaming) return null;

  if (message.from === 'user') {
    const content = message.text?.trim();
    if (!content) return null;
    return { role: 'user', content };
  }

  const content = message.text?.trim() ?? '';
  const llm: AiChatMessage = { role: 'assistant', content };

  if (message.recommendedActivity) {
    llm.recommendedActivity = message.recommendedActivity;
  }
  if (message.createdPost) {
    llm.createdPost = message.createdPost;
  }
  if (message.suggestedReplies?.length) {
    llm.suggestedReplies = message.suggestedReplies;
  }

  if (
    !content &&
    !llm.recommendedActivity &&
    !llm.createdPost &&
    !llm.suggestedReplies?.length
  ) {
    return null;
  }

  return llm;
}

/** Build recent user/assistant turns for WS `messages` (strategy A). */
export function buildLlmChatHistory(
  uiMessages: ChatUiMessage[],
  maxTurns = CHAT_LLM_CONTEXT_TURNS,
): AiChatMessage[] {
  const mapped = uiMessages
    .map((message) => mapUiMessageToLlmMessage(message))
    .filter((message): message is AiChatMessage => message != null);

  return truncateToRecentTurns(mapped, maxTurns);
}
