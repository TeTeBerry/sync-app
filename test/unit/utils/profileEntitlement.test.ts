import { describe, expect, it } from 'vitest';
import { resolveProfileEntitlement } from '@/utils/profileEntitlement';
import type { EventPackageEntitlement } from '@/types/backend';

const proActivity4: EventPackageEntitlement = {
  activityLegacyId: 4,
  tierId: 'pro',
  tierName: 'Pro',
  paidTierId: 'pro',
  quotas: {
    contactUnlock: { limit: 8, used: 0, remaining: 8 },
    map: { days: 7, expiresAt: '2099-01-01T00:00:00.000Z', active: true },
    postPin: { limit: 0, used: 0, remaining: 0 },
    basicExposure: true,
  },
};

const freeActivity1: EventPackageEntitlement = {
  activityLegacyId: 1,
  tierId: 'free',
  tierName: '免费版',
  paidTierId: null,
  quotas: {
    contactUnlock: { limit: 3, used: 0, remaining: 3 },
    map: { days: 0, expiresAt: '1970-01-01T00:00:00.000Z', active: false },
    postPin: { limit: 0, used: 0, remaining: 0 },
    basicExposure: true,
  },
};

describe('resolveProfileEntitlement', () => {
  it('returns free quotas for activity 1 when Pro exists only on activity 4', () => {
    const scoped = resolveProfileEntitlement([freeActivity1], 1);
    expect(scoped?.tierId).toBe('free');
    expect(scoped?.quotas.contactUnlock.limit).toBe(3);
  });

  it('does not use activity 4 Pro when resolving activity 1', () => {
    const picked = resolveProfileEntitlement([proActivity4, freeActivity1], 1);
    expect(picked?.activityLegacyId).toBe(1);
    expect(picked?.paidTierId).toBeNull();
  });

  it('returns Pro when scoped to activity 4', () => {
    const picked = resolveProfileEntitlement([proActivity4, freeActivity1], 4);
    expect(picked?.paidTierId).toBe('pro');
    expect(picked?.quotas.contactUnlock.remaining).toBe(8);
  });
});
