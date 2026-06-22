import type { AiBuddyPostFormValues, BuddyPostTagId } from '../types/buddyPost';
import type { AiGuidePlanFormValues } from '../types/travelGuide';
import { travelGuideBudgetLabel } from '../types/travelGuide';
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
  t: (key: string) => string,
): string | undefined {
  const parts: string[] = [];
  if (guide.accommodationNights > 0) {
    parts.push(`住${guide.accommodationNights}晚`);
  }
  parts.push(`${travelGuideBudgetLabel(guide.budgetTier, t)}住宿`);
  if (guide.selfDrive) {
    parts.push(t('travelPlan.driveYes'));
  }
  const note = parts.join('，');
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
  t?: (key: string) => string,
): TravelGuideBuddyPrefill {
  const dateSeed = defaultBuddyPostForm(activityDate) ?? fallbackDateRange();
  const headcount = guide.headcount > 0 ? String(guide.headcount) : '';
  const resolveT = t ?? ((key: string) => key);

  const form: AiBuddyPostFormValues = {
    dateStart: dateSeed.dateStart,
    dateEnd: dateSeed.dateEnd,
    location: '',
    headcount,
    tags: suggestBuddyTags(),
    note: buildPrefillNote(guide, resolveT),
  };

  const summaryLines = [
    '出发地待填写',
    headcount ? `${headcount}人` : '人数待补充',
    guide.accommodationNights > 0
      ? `住${guide.accommodationNights}晚 · ${travelGuideBudgetLabel(guide.budgetTier, resolveT)}`
      : travelGuideBudgetLabel(guide.budgetTier, resolveT),
    guide.selfDrive ? resolveT('travelPlan.driveYes') : undefined,
  ].filter((line): line is string => Boolean(line));

  return { form, summaryLines };
}

function formatDepartureForSearch(guide: AiGuidePlanFormValues): string | undefined {
  const departure = guide.departure?.trim() || guide.departureCity?.trim();
  if (!departure) return undefined;
  return departure.endsWith('出发') ? departure : `${departure}出发`;
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
  t?: (key: string) => string,
): string {
  const parts: string[] = [];
  const departure = formatDepartureForSearch(guide);
  if (departure) {
    parts.push(departure);
  }

  const dateShort = resolveSearchDateShort(activityDate);
  if (dateShort) {
    parts.push(dateShort);
  }

  const slotsNeeded = resolveRecruitSlotsNeeded(guide.headcount);
  parts.push(`差 ${slotsNeeded} 人`);

  if (t) {
    const budget = travelGuideBudgetLabel(guide.budgetTier, t);
    if (budget) {
      parts.push(budget);
    }
  }

  return parts.join('，');
}
