import { useEffect, useState } from 'react';
import type { TempChatMessage } from '../types/tempChat';
import { mergeTempChatMessages } from '../utils/mergeTempChatMessages';

/** Incremental message list for chat UI (append-only merges, stable references). */
export function useMergedTempChatMessages(
  sessionId: string,
  sourceMessages: TempChatMessage[],
) {
  const [displayMessages, setDisplayMessages] = useState<TempChatMessage[]>([]);

  useEffect(() => {
    setDisplayMessages([]);
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) {
      setDisplayMessages([]);
      return;
    }
    setDisplayMessages((prev) => mergeTempChatMessages(prev, sourceMessages));
  }, [sessionId, sourceMessages]);

  return displayMessages;
}
