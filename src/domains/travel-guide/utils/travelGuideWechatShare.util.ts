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
import { resolveTravelGuideBudgetTier } from './travelGuideBudgetLabels';
import {
  findTravelGuideTotalBudgetItem,
  formatTravelGuideBudgetShareLabel,
} from './travelGuideBudgetDisplay.util';

const BUDGET_TIERS: TravelGuideBudgetTier[] = ['economy', 'standard', 'comfort'];

/** Stable key for memoizing share-query parsing in page hooks. */
export function buildTravelGuideShareQueryKey(
  params: Record<string, string | undefined>,
): string {
  return [
    params.guideId?.trim() ?? '',
    params.activityLegacyId?.trim() ?? '',
    params.departure?.trim() ?? '',
    params.headcount?.trim() ?? '',
    params.budgetTier?.trim() ?? '',
    params.accommodationNights?.trim() ?? '',
    params.selfDrive?.trim() ?? '',
    params.forceRegenerate?.trim() ?? '',
    params.departureCity?.trim() ?? '',
  ].join('\0');
}

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
  return buildTravelGuideGenerationPath(guideId, payload);
}

export function buildTravelGuideGenerationPath(
  guideId: string,
  payload: Pick<TravelGuideDetailPayload, 'form' | 'activityLegacyId'>,
  options?: { forceRegenerate?: boolean },
): string {
  const { form, activityLegacyId } = payload;
  const query: Record<string, string | undefined> = {
    guideId: guideId.trim(),
    departure: form.departure,
    headcount: String(form.headcount),
    ...(form.budgetTier ? { budgetTier: form.budgetTier } : {}),
    accommodationNights: String(form.accommodationNights ?? 0),
    selfDrive: form.selfDrive ? '1' : '0',
    ...(options?.forceRegenerate ? { forceRegenerate: '1' } : {}),
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
): {
  form: AiGuidePlanFormValues;
  activityLegacyId: number;
  forceRegenerate: boolean;
} | null {
  const activityLegacyId = Number(params.activityLegacyId);
  const departure = params.departure?.trim() ?? '';
  const headcount = Number(params.headcount);
  const budgetTier = resolveTravelGuideBudgetTier(
    params.budgetTier?.trim() as TravelGuideBudgetTier | undefined,
  );
  const accommodationNightsRaw = Number(params.accommodationNights);
  const accommodationNights = Number.isFinite(accommodationNightsRaw)
    ? Math.max(0, accommodationNightsRaw)
    : NaN;
  const selfDrive = params.selfDrive === '1' || params.selfDrive === 'true';
  const forceRegenerate =
    params.forceRegenerate === '1' || params.forceRegenerate === 'true';

  if (!Number.isFinite(activityLegacyId) || activityLegacyId <= 0) return null;
  if (!departure) return null;
  if (!Number.isFinite(headcount) || headcount <= 0) return null;
  if (!BUDGET_TIERS.includes(budgetTier)) return null;
  if (!Number.isFinite(accommodationNights)) return null;

  return {
    activityLegacyId,
    forceRegenerate,
    form: {
      departure,
      departureCity: params.departureCity?.trim() || undefined,
      headcount,
      budgetTier,
      accommodationNights,
      selfDrive,
      ...(forceRegenerate ? { forceRegenerate: true } : {}),
    },
  };
}
