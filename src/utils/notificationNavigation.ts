import { parseActivityLegacyId } from './activityLegacyId';
import type { NotificationMeta } from '../types/backend';

/** Legacy post notifications: navigate to activity when possible. */
export async function resolveNotificationPostTarget(
  meta: NotificationMeta,
): Promise<{ activityLegacyId: number } | null> {
  const legacyId = parseActivityLegacyId(meta.activityLegacyId);
  if (legacyId == null) {
    return null;
  }
  return { activityLegacyId: legacyId };
}
