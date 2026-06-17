import Taro from '@tarojs/taro';
import type { BackendActivity } from '@/types/backend';
import { useAiChatStore } from '@/stores/aiChatStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { seedActivityDetailCache } from '@/utils/activityDetailCache';
import { createWelcomeChatMessage } from '@/utils/aiAssistantCapabilityDiscovery';
import { buildAiChatScopeKey } from '@/utils/aiChatScope';

export const ACTIVITY_SCOPE_HEADER = 'X-Activity-Id';

export type BindActivityOptions = {
  activityName?: string;
  activity?: BackendActivity;
  /** Write a fresh welcome message into the chat scope bucket. */
  syncChatWelcome?: boolean;
  showToast?: boolean;
};

function normalizeLegacyId(legacyId: number): number | null {
  if (!Number.isFinite(legacyId) || legacyId <= 0) return null;
  return legacyId;
}

export function getActiveActivityLegacyId(): number | null {
  return useNavigationStore.getState().activeActivityLegacyId;
}

export function getActivityScopeHeaders(): Record<string, string> {
  const legacyId = getActiveActivityLegacyId();
  if (legacyId == null) return {};
  return { [ACTIVITY_SCOPE_HEADER]: String(legacyId) };
}

/**
 * Single entry for activity scope: navigation store + AI chat scope bucket.
 * HTTP / WS callers should read `getActivityScopeHeaders()` or `getActiveActivityLegacyId()`.
 */
export function bindActivity(
  legacyId: number,
  options: BindActivityOptions = {},
): boolean {
  const normalized = normalizeLegacyId(legacyId);
  if (normalized == null) return false;

  if (options.activity) {
    seedActivityDetailCache(options.activity);
  }

  useNavigationStore.getState().setActiveActivityLegacyId(normalized);

  const scopeKey = buildAiChatScopeKey(normalized);
  useAiChatStore.getState().setActiveScope(scopeKey);

  if (options.syncChatWelcome) {
    const name =
      options.activityName?.trim() || options.activity?.name?.trim() || undefined;
    const welcome = [createWelcomeChatMessage(name, normalized)];
    useAiChatStore.getState().setScopeMessages(scopeKey, welcome);
  }

  if (options.showToast) {
    const title =
      options.activityName?.trim() || options.activity?.name?.trim() || '本场活动';
    void Taro.showToast({ title: `已绑定「${title}」`, icon: 'none' });
  }

  return true;
}

export function clearActivityScope(): void {
  useNavigationStore.getState().setActiveActivityLegacyId(null);
  useAiChatStore.getState().setActiveScope(buildAiChatScopeKey(undefined));
}

export function bindActivityFromPicker(activity: BackendActivity): boolean {
  if (activity.legacyId == null || Number.isNaN(activity.legacyId)) {
    return false;
  }

  const activityName = activity.name?.trim() || '本场活动';
  return bindActivity(activity.legacyId, {
    activity,
    activityName,
    syncChatWelcome: true,
    showToast: true,
  });
}
