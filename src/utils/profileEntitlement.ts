import type { EventPackageEntitlement } from "../types/backend";

/** Pick entitlement row for the active activity scope (or first available). */
export function resolveProfileEntitlement(
  entitlements: EventPackageEntitlement[] | undefined,
  activityLegacyId?: number,
): EventPackageEntitlement | null {
  if (!entitlements?.length) return null;

  if (activityLegacyId != null && !Number.isNaN(activityLegacyId)) {
    const scoped = entitlements.find((item) => item.activityLegacyId === activityLegacyId);
    if (scoped) return scoped;
  }

  return entitlements[0] ?? null;
}

/** Effective AI match remaining after free + paid merge (`null` = unlimited). */
export function getAiMatchRemaining(entitlement: EventPackageEntitlement | null): number | null {
  if (!entitlement) return null;
  return entitlement.quotas.aiMatch.remaining;
}

/** True when the user has no AI matches left (not unlimited). */
export function isAiMatchQuotaExhausted(entitlement: EventPackageEntitlement | null): boolean {
  const remaining = getAiMatchRemaining(entitlement);
  return remaining === 0;
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
