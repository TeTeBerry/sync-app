/** Keep in sync with sync-app-backend/src/ai/publish/buddy-post-flow.util.ts */
export const SELF_POST_COLLECT_BODY_MARKER = '【填写组队帖】';
export const REQUIRE_BUDDY_POST_MARKER = '【先填写组队信息】';
export const BUDDY_POST_SHEET_ACTION_LABEL = '组队发帖';

export function isBuddyPostTemplatePrompt(text?: string | null): boolean {
  const trimmed = text?.trim();
  if (!trimmed) return false;
  return (
    trimmed.includes(SELF_POST_COLLECT_BODY_MARKER) ||
    trimmed.includes(REQUIRE_BUDDY_POST_MARKER)
  );
}

export function filterBuddyPostSheetShortcutReplies(replies?: string[]): string[] {
  if (!replies?.length) return [];
  return replies.filter((reply) => reply.trim() !== BUDDY_POST_SHEET_ACTION_LABEL);
}
