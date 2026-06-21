import { isActivityBoundForCapabilities } from '@/utils/aiAssistantCapabilityDiscovery';

/** Collapsed message list height @ 375px viewport. */
export const AI_CHAT_COLLAPSED_PX = 176;

/** Unbound: chat is primary onboarding — expanded. Bound: plan chrome first — collapsed. */
export function resolveDefaultChatExpanded(activityLegacyId?: number): boolean {
  return !isActivityBoundForCapabilities(activityLegacyId);
}

export function isChatSectionCollapsible(activityLegacyId?: number): boolean {
  return isActivityBoundForCapabilities(activityLegacyId);
}
