import type { AiChatMessage, ChatUiMessage } from "../types/aiChat";

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

/** 构建发给后端的对话上下文（排除 UI 欢迎语） */
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
