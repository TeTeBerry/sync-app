import type { AiChatImageContext, AiChatMessage, ChatUiMessage } from "../types/aiChat";

function resolveImageContext(message: ChatUiMessage, pendingImage?: string): AiChatImageContext | undefined {
  const source = message.imagePreview || pendingImage;
  if (!source && !message.ocrText) return undefined;
  return {
    source,
    ocrText: message.ocrText,
  };
}

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
      imagePreview: message.imageContext?.source,
      ocrText: message.imageContext?.ocrText,
      recommendedPosts: message.recommendedPosts,
      recommendedActivity: message.recommendedActivity,
      createdPost: message.createdPost,
      suggestedReplies: message.suggestedReplies,
    }));
}

/** 构建发给后端的完整对话（排除 UI 欢迎语；后端自行截断 LLM 上下文） */
export function buildApiChatHistory(
  uiMessages: ChatUiMessage[],
  welcomeText: string,
  pendingUserText?: string,
  pendingImage?: string,
): AiChatMessage[] {
  const settled = uiMessages.filter(
    (message) =>
      !message.streaming &&
      (message.text ||
        message.imagePreview ||
        message.ocrText ||
        message.recommendedPosts?.length ||
        message.recommendedActivity ||
        message.createdPost ||
        message.suggestedReplies?.length),
  );
  const apiMessages: AiChatMessage[] = [];

  for (let index = 0; index < settled.length; index += 1) {
    const message = settled[index];
    if (index === 0 && message.from === "ai" && message.text === welcomeText) {
      continue;
    }
    apiMessages.push({
      role: message.from === "user" ? "user" : "assistant",
      content: message.text || message.ocrText || "",
      imageContext: resolveImageContext(message),
      recommendedPosts: message.recommendedPosts,
      recommendedActivity: message.recommendedActivity,
      createdPost: message.createdPost,
      suggestedReplies: message.suggestedReplies,
    });
  }

  if (pendingUserText || pendingImage) {
    const trimmedPending = pendingUserText?.trim() ?? "";
    const lastApi = apiMessages[apiMessages.length - 1];
    const duplicateUserText =
      Boolean(trimmedPending) &&
      !pendingImage &&
      lastApi?.role === "user" &&
      lastApi.content === trimmedPending;

    if (!duplicateUserText) {
      apiMessages.push({
        role: "user",
        content: trimmedPending,
        imageContext: pendingImage ? { source: pendingImage } : undefined,
      });
    } else if (pendingImage && lastApi?.role === "user") {
      lastApi.imageContext = { source: pendingImage };
    }
  }

  return apiMessages;
}
