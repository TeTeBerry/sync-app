import type { AiBuddyPostFormValues, BuddyPostTagId } from '../types/buddyPost';
import type { AiGuidePlanFormValues } from '../types/travelGuide';
import { travelGuideBudgetLabel } from '@/domains/travel-guide/utils/travelGuideBudgetLabels';
import { t as defaultT } from '@/i18n';
import { defaultBuddyPostForm } from './buddyPostForm';
import {
  formatBuddyPostDateShort,
  parseActivityDateBounds,
  boundsToIsoDate,
} from './activityDateBounds';

export type TravelGuideBuddyPrefill = {
  form: AiBuddyPostFormValues;
  /** Short lines shown in the buddy sheet banner. */
  summaryLines: string[];
};

export type BuddyPostSheetPrefill = TravelGuideBuddyPrefill & {
  prefillBannerTitle?: string;
};

function suggestBuddyTags(): BuddyPostTagId[] {
  return ['team'];
}

function buildPrefillNote(
  guide: AiGuidePlanFormValues,
  resolveT: (key: string, params?: Record<string, string | number>) => string,
): string | undefined {
  const parts: string[] = [];
  const nights = guide.accommodationNights ?? 0;
  if (nights > 0) {
    parts.push(resolveT('travelGuide.stayNightsChip', { count: nights }));
  }
  if (guide.budgetTier) {
    parts.push(
      resolveT('travelGuide.accommodationWithTier', {
        label: travelGuideBudgetLabel(guide.budgetTier, resolveT),
      }),
    );
  }
  if (guide.selfDrive) {
    parts.push(resolveT('travelPlan.driveYes'));
  }
  const note = parts.join(resolveT('common.listSeparator'));
  return note || undefined;
}

function fallbackDateRange(): Pick<AiBuddyPostFormValues, 'dateStart' | 'dateEnd'> {
  const today = new Date();
  const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return { dateStart: iso, dateEnd: iso };
}

/**
 * Map a completed travel-guide plan form into buddy-post sheet defaults.
 * Activity dates fill the calendar range; departure is left for the user.
 */
export function travelGuideFormToBuddyPrefill(
  guide: AiGuidePlanFormValues,
  activityDate?: string,
  t?: (key: string, params?: Record<string, string | number>) => string,
): TravelGuideBuddyPrefill {
  const dateSeed = defaultBuddyPostForm(activityDate) ?? fallbackDateRange();
  const headcount = guide.headcount > 0 ? String(guide.headcount) : '';
  const resolveT = t ?? defaultT;

  const form: AiBuddyPostFormValues = {
    dateStart: dateSeed.dateStart,
    dateEnd: dateSeed.dateEnd,
    location: '',
    headcount,
    tags: suggestBuddyTags(),
    recruitUnityTags: [],
    note: buildPrefillNote(guide, resolveT),
  };

  const nights = guide.accommodationNights ?? 0;
  const summaryLines = [
    resolveT('travelGuide.departurePending'),
    headcount
      ? resolveT('travelGuide.headcountChip', { count: guide.headcount })
      : resolveT('travelGuide.headcountPending'),
    nights > 0 && guide.budgetTier
      ? `${resolveT('travelGuide.stayNightsChip', { count: nights })} · ${travelGuideBudgetLabel(guide.budgetTier, resolveT)}`
      : guide.budgetTier
        ? travelGuideBudgetLabel(guide.budgetTier, resolveT)
        : nights > 0
          ? resolveT('travelGuide.stayNightsChip', { count: nights })
          : undefined,
    guide.selfDrive ? resolveT('travelPlan.driveYes') : undefined,
  ].filter((line): line is string => Boolean(line));

  return { form, summaryLines };
}

function formatDepartureForSearch(
  guide: AiGuidePlanFormValues,
  resolveT: (key: string, params?: Record<string, string | number>) => string,
): string | undefined {
  const departure = guide.departure?.trim() || guide.departureCity?.trim();
  if (!departure) return undefined;
  const suffix = resolveT('travelGuide.departureSuffix');
  if (suffix && departure.endsWith(suffix)) {
    return departure;
  }
  if (suffix) {
    return `${departure}${suffix}`;
  }
  return resolveT('travelGuide.departureChip', { departure });
}

function resolveSearchDateShort(activityDate?: string): string | undefined {
  const bounds = parseActivityDateBounds(activityDate);
  if (!bounds) return undefined;
  const dateStart = boundsToIsoDate(bounds, bounds.dayStart);
  const dateEnd = boundsToIsoDate(bounds, bounds.dayEnd);
  return formatBuddyPostDateShort(dateStart, dateEnd);
}

function resolveRecruitSlotsNeeded(headcount: number): number {
  if (!Number.isFinite(headcount) || headcount <= 0) return 1;
  return headcount > 1 ? headcount - 1 : 1;
}

/**
 * Map a completed travel-guide plan form into an AI recruit-search query.
 * User can edit the prefilled text before searching.
 */
export function travelGuideFormToSearchQuery(
  guide: AiGuidePlanFormValues,
  activityDate?: string,
  t?: (key: string, params?: Record<string, string | number>) => string,
): string {
  const resolveT = t ?? defaultT;
  const parts: string[] = [];
  const departure = formatDepartureForSearch(guide, resolveT);
  if (departure) {
    parts.push(departure);
  }

  const dateShort = resolveSearchDateShort(activityDate);
  if (dateShort) {
    parts.push(dateShort);
  }

  const slotsNeeded = resolveRecruitSlotsNeeded(guide.headcount);
  parts.push(resolveT('travelGuide.searchSlotsNeeded', { count: slotsNeeded }));

  if (guide.budgetTier) {
    const budget = travelGuideBudgetLabel(guide.budgetTier, resolveT);
    if (budget) {
      parts.push(budget);
    }
  }

  return parts.join(resolveT('common.listSeparator'));
}
