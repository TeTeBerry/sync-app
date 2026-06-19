import { getTravelGuideTitle } from '@/constants/aiCtaLabels';
import type {
  AiGuidePlanFormValues,
  TravelGuideBudgetTier,
  TravelGuidePlan,
} from '@/types/travelGuide';
import { resolveCatalogActivityImage } from '@/constants/activityCatalogImages';
import { ROUTES } from '@/utils/route';
import { buildQueryString } from '@/utils/queryString';
import type { TravelGuideDetailPayload } from './travelGuideDetailStorage';
import {
  findTravelGuideTotalBudgetItem,
  formatTravelGuideBudgetShareLabel,
} from './travelGuideBudgetDisplay.util';

const BUDGET_TIERS: TravelGuideBudgetTier[] = ['economy', 'standard', 'comfort'];

export function buildTravelGuideShareTitle(plan: TravelGuidePlan): string {
  const total = findTravelGuideTotalBudgetItem(plan);
  if (total) {
    return `${plan.activityName} · ${getTravelGuideTitle()}（${formatTravelGuideBudgetShareLabel(total.range, plan.headcount)}）`;
  }
  return `${plan.activityName} · ${getTravelGuideTitle()}`;
}

export function buildTravelGuideSharePath(
  guideId: string,
  payload: Pick<TravelGuideDetailPayload, 'form' | 'activityLegacyId'>,
): string {
  const { form, activityLegacyId } = payload;
  const query: Record<string, string | undefined> = {
    guideId: guideId.trim(),
    departure: form.departure,
    headcount: String(form.headcount),
    budgetTier: form.budgetTier,
    accommodationNights: String(form.accommodationNights),
    selfDrive: form.selfDrive ? '1' : '0',
  };
  if (activityLegacyId != null && !Number.isNaN(activityLegacyId)) {
    query.activityLegacyId = String(activityLegacyId);
  }
  if (form.departureCity?.trim()) {
    query.departureCity = form.departureCity.trim();
  }
  const qs = buildQueryString(query);
  return qs ? `${ROUTES.AI_TRAVEL_GUIDE}?${qs}` : ROUTES.AI_TRAVEL_GUIDE;
}

export function buildTravelGuideShareImageUrl(
  activityLegacyId?: number,
  image?: string | null,
): string | undefined {
  if (activityLegacyId == null || Number.isNaN(activityLegacyId)) return undefined;
  const url = resolveCatalogActivityImage(activityLegacyId, image)?.trim();
  return url && /^https?:\/\//i.test(url) ? url : undefined;
}

export function buildTravelGuideShareAppMessage(
  guideId: string,
  payload: TravelGuideDetailPayload,
  image?: string | null,
) {
  return {
    title: buildTravelGuideShareTitle(payload.plan),
    path: buildTravelGuideSharePath(guideId, payload),
    imageUrl: buildTravelGuideShareImageUrl(payload.activityLegacyId, image),
  };
}

export function buildTravelGuideShareTimeline(
  guideId: string,
  payload: TravelGuideDetailPayload,
  image?: string | null,
) {
  const query = buildTravelGuideSharePath(guideId, payload).split('?')[1] ?? '';
  return {
    title: buildTravelGuideShareTitle(payload.plan),
    query,
    imageUrl: buildTravelGuideShareImageUrl(payload.activityLegacyId, image),
  };
}

export function parseTravelGuideFormFromShareQuery(
  params: Record<string, string | undefined>,
): { form: AiGuidePlanFormValues; activityLegacyId: number } | null {
  const activityLegacyId = Number(params.activityLegacyId);
  const departure = params.departure?.trim() ?? '';
  const headcount = Number(params.headcount);
  const budgetTier = params.budgetTier?.trim() as TravelGuideBudgetTier | undefined;
  const accommodationNights = Number(params.accommodationNights);
  const selfDrive = params.selfDrive === '1' || params.selfDrive === 'true';

  if (!Number.isFinite(activityLegacyId) || activityLegacyId <= 0) return null;
  if (!departure) return null;
  if (!Number.isFinite(headcount) || headcount <= 0) return null;
  if (!budgetTier || !BUDGET_TIERS.includes(budgetTier)) return null;
  if (!Number.isFinite(accommodationNights) || accommodationNights <= 0) return null;

  return {
    activityLegacyId,
    form: {
      departure,
      departureCity: params.departureCity?.trim() || undefined,
      headcount,
      budgetTier,
      accommodationNights,
      selfDrive,
    },
  };
}
