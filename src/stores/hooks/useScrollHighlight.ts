import { useEffect } from "react";

type UseScrollHighlightOptions = {
  highlightId: string | number | null;
  elementId: (id: string | number) => string;
  ready?: boolean;
  enabled?: boolean;
  scrollDelayMs?: number;
  clearDelayMs?: number;
  onClear?: () => void;
};

/** 列表渲染完成后滚动到目标项并自动清除高亮 */
export function useScrollHighlight({
  highlightId,
  elementId,
  ready = true,
  enabled = true,
  scrollDelayMs = 180,
  clearDelayMs = 2800,
  onClear,
}: UseScrollHighlightOptions) {
  useEffect(() => {
    if (!enabled || highlightId == null || !ready) return;

    const scrollTimer = window.setTimeout(() => {
      document.getElementById(elementId(highlightId))?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, scrollDelayMs);

    const clearTimer = window.setTimeout(() => {
      onClear?.();
    }, clearDelayMs);

    return () => {
      window.clearTimeout(scrollTimer);
      window.clearTimeout(clearTimer);
    };
  }, [
    clearDelayMs,
    elementId,
    enabled,
    highlightId,
    onClear,
    ready,
    scrollDelayMs,
  ]);
}
