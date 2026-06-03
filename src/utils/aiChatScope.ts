/** In-memory AI chat bucket key (cleared when the mini program exits). */
export type AiChatScopeKey = string;

export function buildAiChatScopeKey(activityLegacyId?: number): AiChatScopeKey {
  if (activityLegacyId != null && !Number.isNaN(activityLegacyId)) {
    return `activity:${activityLegacyId}`;
  }
  return 'global';
}
