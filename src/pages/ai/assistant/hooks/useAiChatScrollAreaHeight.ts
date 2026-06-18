import { useMemo } from 'react';
import { useMeasuredElementHeight } from '../../../../hooks/useMeasuredElementHeight';
import { computeTabPageMainHeightFallback } from '../../../../hooks/tabPageMainHeight.util';

export const AI_CHAT_SCROLL_HOST_ID = 'ai-chat-scroll-host';

/** Rough chrome total @ 375 — only used before flex measure succeeds. */
const AI_CHAT_SCROLL_FALLBACK_SUBTRACT_PX = 280;

export function useAiChatScrollAreaHeight(
  remeasureKey: string | number,
  options?: { enabled?: boolean },
): number | undefined {
  const enabled = options?.enabled !== false;
  const fallbackHeight = useMemo(
    () => computeTabPageMainHeightFallback(AI_CHAT_SCROLL_FALLBACK_SUBTRACT_PX),
    [],
  );

  return useMeasuredElementHeight(`#${AI_CHAT_SCROLL_HOST_ID}`, {
    remeasureKey,
    fallbackHeight,
    enabled,
  });
}
