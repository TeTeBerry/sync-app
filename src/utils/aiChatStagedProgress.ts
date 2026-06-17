import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import {
  AI_CHAT_PROGRESS_STAGE_INTERVAL_MS,
  type AiChatProgressKind,
  getAiChatProgressLabel,
  getAiChatProgressStages,
} from '../constants/aiChatProgress';
import type { ChatUiMessage } from '../types/aiChat';

export function withAiChatProgress(
  message: ChatUiMessage,
  kind: AiChatProgressKind,
): ChatUiMessage {
  return {
    ...message,
    progressKind: kind,
    text: getAiChatProgressLabel(kind),
    streaming: true,
  };
}

export function clearAiChatProgress(message: ChatUiMessage): ChatUiMessage {
  if (!message.progressKind) {
    return message;
  }
  const { progressKind: _progressKind, ...rest } = message;
  return rest;
}

export function startAiChatStagedProgress(options: {
  aiMsgId: string;
  kind: AiChatProgressKind;
  messagesRef: MutableRefObject<ChatUiMessage[]>;
  setMessages: Dispatch<SetStateAction<ChatUiMessage[]>>;
  intervalMs?: number;
}): () => void {
  const {
    aiMsgId,
    kind,
    messagesRef,
    setMessages,
    intervalMs = AI_CHAT_PROGRESS_STAGE_INTERVAL_MS,
  } = options;

  const stages = getAiChatProgressStages(kind);
  let stageIndex = 0;

  const timer = setInterval(() => {
    stageIndex = Math.min(stageIndex + 1, stages.length - 1);
    const stageText = stages[stageIndex];
    messagesRef.current = messagesRef.current.map((message) =>
      message.id === aiMsgId && message.streaming && message.progressKind === kind
        ? { ...message, text: stageText }
        : message,
    );
    setMessages([...messagesRef.current]);
  }, intervalMs);

  return () => clearInterval(timer);
}
