import { labelMatchesKey } from '@/i18n';
import { isActivityBoundForCapabilities } from './aiAssistantCapabilityDiscovery';

const CHECKLIST_DUPLICATE_KEYS = [
  'ai.generateTravelGuide',
  'ai.generateItinerary',
  'ai.buddyPost',
] as const;

function isChecklistDuplicateReply(reply: string): boolean {
  const trimmed = reply.trim();
  return CHECKLIST_DUPLICATE_KEYS.some((key) => labelMatchesKey(trimmed, key));
}

/** Composer festival shortcut chips are replaced by welcome picker + event context. */
export function shouldShowComposerActivityChips(): boolean {
  return false;
}

export function shouldSuppressPlanSheetCtAs(
  activityLegacyId?: number,
  conversationFlow?: string,
): boolean {
  if (!isActivityBoundForCapabilities(activityLegacyId)) return false;
  if (
    conversationFlow === 'collect_post_body' ||
    conversationFlow === 'publish_confirm'
  ) {
    return false;
  }
  return true;
}

export function filterChecklistDuplicateSuggestedReplies(
  replies: string[] | undefined,
  activityLegacyId?: number,
): string[] | undefined {
  if (!isActivityBoundForCapabilities(activityLegacyId) || !replies?.length) {
    return replies;
  }
  const filtered = replies.filter((reply) => !isChecklistDuplicateReply(reply));
  return filtered.length > 0 ? filtered : undefined;
}
