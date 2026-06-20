import { getBuddyPostCta } from '../constants/aiCtaLabels';
import { translate } from '@/i18n';

/** Keep in sync with sync-app-backend/src/ai/publish/buddy-post-flow.util.ts */
export const SELF_POST_COLLECT_BODY_MARKER = '【填写组队帖】';
export const REQUIRE_BUDDY_POST_MARKER = '【先填写组队信息】';

export function getBuddyPostSheetActionLabel(): string {
  return getBuddyPostCta();
}

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
  const labels = [
    getBuddyPostSheetActionLabel(),
    translate('ai.buddyPost', 'zh-CN'),
    translate('ai.buddyPost', 'en-US'),
  ];
  return replies.filter((reply) => !labels.includes(reply.trim()));
}
