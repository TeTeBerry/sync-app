import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import { shouldSuppressAutoScrollForMessage } from '../../../../components/ai-chat/chatMessageListScroll';
import type { ChatUiMessage } from '../../../../types/aiChat';

export function useAiAssistantScroll(options: {
  messagesRef: MutableRefObject<ChatUiMessage[]>;
  messageCount: number;
  pageShowSeq: number;
}) {
  const { messagesRef, messageCount, pageShowSeq } = options;
  const pendingPageShowScrollRef = useRef(false);
  const [forceScrollToBottomKey, setForceScrollToBottomKey] = useState(0);

  const bumpScrollToBottom = useCallback(() => {
    setForceScrollToBottomKey((key) => key + 1);
  }, []);

  const scheduleScrollToBottom = useCallback(() => {
    const last = messagesRef.current[messagesRef.current.length - 1];
    if (shouldSuppressAutoScrollForMessage(last)) return;
    bumpScrollToBottom();
  }, [bumpScrollToBottom, messagesRef]);

  useEffect(() => {
    if (pageShowSeq === 0) return;
    pendingPageShowScrollRef.current = true;
  }, [pageShowSeq]);

  useEffect(() => {
    if (!pendingPageShowScrollRef.current) return;
    if (messageCount === 0) return;
    pendingPageShowScrollRef.current = false;
    scheduleScrollToBottom();
  }, [messageCount, pageShowSeq, scheduleScrollToBottom]);

  return {
    forceScrollToBottomKey,
    scheduleScrollToBottom,
  };
}
