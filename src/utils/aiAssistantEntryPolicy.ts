import {
  BUDDY_POST_CTA,
  GENERATE_ITINERARY_CTA,
  GENERATE_TRAVEL_GUIDE_CTA,
} from '../constants/aiCtaLabels';
import { isActivityBoundForCapabilities } from './aiAssistantCapabilityDiscovery';

const CHECKLIST_DUPLICATE_REPLY_LABELS = new Set([
  GENERATE_TRAVEL_GUIDE_CTA,
  GENERATE_ITINERARY_CTA,
  BUDDY_POST_CTA,
]);

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
  const filtered = replies.filter(
    (reply) => !CHECKLIST_DUPLICATE_REPLY_LABELS.has(reply.trim()),
  );
  return filtered.length > 0 ? filtered : undefined;
}
