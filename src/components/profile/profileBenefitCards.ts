import type { EventPackageEntitlement, ProfileActivityItem } from '../../types/backend';
import { compareActivitiesNearestFirst } from '../../utils/activityStatus';
import {
  buildEventBenefitCardModel,
  listPaidEntitlements,
  type ProfileEventBenefitCardModel,
} from './profileBenefitsMapper';

export function buildPaidBenefitCards(
  paidEntitlements: EventPackageEntitlement[],
  activityByLegacyId: Map<number, ProfileActivityItem>,
): ProfileEventBenefitCardModel[] {
  const cards: ProfileEventBenefitCardModel[] = [];
  for (const entitlement of paidEntitlements) {
    if (
      !Number.isFinite(entitlement.activityLegacyId) ||
      entitlement.activityLegacyId <= 0
    ) {
      continue;
    }
    try {
      cards.push(
        buildEventBenefitCardModel(
          entitlement,
          activityByLegacyId.get(entitlement.activityLegacyId),
        ),
      );
    } catch (error) {
      console.warn('[Profile] skip invalid entitlement card', entitlement, error);
    }
  }
  return cards;
}

/** Profile tab preview: cards for the nearest upcoming / most relevant activity only. */
export function pickRecentActivityBenefitCards(
  cards: ProfileEventBenefitCardModel[],
  activityByLegacyId: Map<number, ProfileActivityItem>,
): ProfileEventBenefitCardModel[] {
  if (cards.length === 0) {
    return [];
  }
  const sorted = [...cards].sort((a, b) => {
    const actA = activityByLegacyId.get(a.activityLegacyId);
    const actB = activityByLegacyId.get(b.activityLegacyId);
    return compareActivitiesNearestFirst(
      { date: actA?.date, title: actA?.title },
      { date: actB?.date, title: actB?.title },
    );
  });
  const primaryLegacyId = sorted[0]?.activityLegacyId;
  if (primaryLegacyId == null) {
    return sorted.slice(0, 1);
  }
  return sorted.filter((card) => card.activityLegacyId === primaryLegacyId);
}

export function buildActivityByLegacyIdMap(
  items: ProfileActivityItem[],
): Map<number, ProfileActivityItem> {
  const map = new Map<number, ProfileActivityItem>();
  for (const item of items) {
    const legacyId = Number(item.id);
    if (Number.isFinite(legacyId) && legacyId > 0) {
      map.set(legacyId, item);
    }
  }
  return map;
}

export { listPaidEntitlements };
