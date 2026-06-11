import type { EventPackageEntitlement } from '../types/backend';

/** Pick entitlement row for the active activity scope (or first available). */
export function resolveProfileEntitlement(
  entitlements: EventPackageEntitlement[] | undefined,
  activityLegacyId?: number,
): EventPackageEntitlement | null {
  if (!entitlements?.length) return null;

  if (activityLegacyId != null && !Number.isNaN(activityLegacyId)) {
    const scoped = entitlements.find(
      (item) => item.activityLegacyId === activityLegacyId,
    );
    if (scoped) return scoped;
  }

  return entitlements[0] ?? null;
}

/** Effective contact-unlock remaining after free + paid merge (`null` = unlimited). */
export function getContactUnlockRemaining(
  entitlement: EventPackageEntitlement | null,
): number | null {
  if (!entitlement) return null;
  return entitlement.quotas.contactUnlock.remaining;
}

/** True when the user has no contact unlocks left (not unlimited). */
export function isContactUnlockQuotaExhausted(
  entitlement: EventPackageEntitlement | null,
): boolean {
  const remaining = getContactUnlockRemaining(entitlement);
  return remaining === 0;
}
