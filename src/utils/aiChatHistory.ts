import type { AiChatMessage, ChatUiMessage } from "../types/aiChat";

/** 将 MongoDB 完整历史映射为 UI 消息（不做截断） */
export function mapHistoryToUiMessages(
  history: AiChatMessage[],
  sessionId: string,
): ChatUiMessage[] {
  return history
    .filter((message) => message.role === "user" || message.role === "assistant")
    .map((message, index) => ({
      id: `${sessionId}-${index}`,
      from: message.role === "user" ? "user" : "ai",
      text: message.content,
    }));
}

/** 构建发给后端的完整对话（排除 UI 欢迎语；后端自行截断 LLM 上下文） */
export function buildApiChatHistory(
  uiMessages: ChatUiMessage[],
  welcomeText: string,
  pendingUserText?: string,
): AiChatMessage[] {
  const settled = uiMessages.filter((message) => !message.streaming && message.text);
  const apiMessages: AiChatMessage[] = [];

  for (let index = 0; index < settled.length; index += 1) {
    const message = settled[index];
    if (index === 0 && message.from === "ai" && message.text === welcomeText) {
      continue;
    }
    apiMessages.push({
      role: message.from === "user" ? "user" : "assistant",
      content: message.text,
    });
  }

  if (pendingUserText) {
    apiMessages.push({ role: "user", content: pendingUserText });
  }

  return apiMessages;
}
