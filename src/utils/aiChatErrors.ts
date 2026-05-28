/** User-facing fallback when stream fails (prod) or dev detail is empty. */
export function formatAiChatStreamError(
  error: unknown,
  fallback: string,
): string {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  if (!message.trim()) return fallback;
  if (process.env.NODE_ENV === "production") return fallback;
  return message.trim();
}

/** Toast title: dev shows real error (truncated); prod uses fallback. */
export function formatAiChatToastError(
  error: unknown,
  fallback: string,
  maxLen = 80,
): string {
  const text = formatAiChatStreamError(error, fallback);
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen - 3)}...`;
}
