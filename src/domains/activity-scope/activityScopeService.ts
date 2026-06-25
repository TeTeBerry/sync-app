import type { BackendActivity } from '@/types/backend';
import { t } from '@/i18n';
import { useNavigationStore } from '@/stores/navigationStore';
import { seedActivityDetailCache } from '@/utils/activityDetailCache';
import { registerActivityOnSelectSilently } from '@/utils/registerActivityOnSelect';
import { showAppToast } from '@/utils/appToast';

export const ACTIVITY_SCOPE_HEADER = 'X-Activity-Id';

export type BindActivityOptions = {
  activityName?: string;
  activity?: BackendActivity;
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
 * Single entry for activity scope: navigation store.
 * HTTP callers should read `getActivityScopeHeaders()` or `getActiveActivityLegacyId()`.
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

  if (options.showToast) {
    const title =
      options.activityName?.trim() ||
      options.activity?.name?.trim() ||
      t('activityScope.defaultTitle');
    showAppToast('activityScope.bound', { params: { title }, icon: 'none' });
  }

  registerActivityOnSelectSilently(normalized);

  return true;
}

export function clearActivityScope(): void {
  useNavigationStore.getState().setActiveActivityLegacyId(null);
}

export function bindActivityFromPicker(activity: BackendActivity): boolean {
  if (activity.legacyId == null || Number.isNaN(activity.legacyId)) {
    return false;
  }

  const activityName = activity.name?.trim() || '本场活动';
  return bindActivity(activity.legacyId, {
    activity,
    activityName,
    showToast: true,
  });
}
