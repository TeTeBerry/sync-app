import type { AiBuddyPostFormValues, BuddyPostTagId } from '../types/buddyPost';
import type { AiGuidePlanFormValues } from '../types/travelGuide';
import { travelGuideBudgetLabel } from '../types/travelGuide';
import { defaultBuddyPostForm } from './buddyPostForm';

export type TravelGuideBuddyPrefill = {
  form: AiBuddyPostFormValues;
  /** Short lines shown in the buddy sheet banner. */
  summaryLines: string[];
};

function resolveBuddyLocation(guide: AiGuidePlanFormValues): string {
  const departure = guide.departure.trim();
  if (departure) return departure;
  return guide.departureCity?.trim() ?? '';
}

function suggestBuddyTags(guide: AiGuidePlanFormValues): BuddyPostTagId[] {
  const tags = new Set<BuddyPostTagId>(['team']);
  if (guide.accommodationNights > 0) {
    tags.add('accommodation');
  }
  if (guide.selfDrive) {
    tags.add('carpool');
  }
  return [...tags];
}

function buildPrefillNote(guide: AiGuidePlanFormValues): string | undefined {
  const parts: string[] = [];
  if (guide.accommodationNights > 0) {
    parts.push(`住${guide.accommodationNights}晚`);
  }
  parts.push(`${travelGuideBudgetLabel(guide.budgetTier)}住宿`);
  if (guide.selfDrive) {
    parts.push('自驾出行');
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
 * Activity dates fill the calendar range; guide supplies location, headcount, tags, note.
 */
export function travelGuideFormToBuddyPrefill(
  guide: AiGuidePlanFormValues,
  activityDate?: string,
): TravelGuideBuddyPrefill {
  const dateSeed = defaultBuddyPostForm(activityDate) ?? fallbackDateRange();
  const location = resolveBuddyLocation(guide);
  const headcount = guide.headcount > 0 ? String(guide.headcount) : '';

  const form: AiBuddyPostFormValues = {
    dateStart: dateSeed.dateStart,
    dateEnd: dateSeed.dateEnd,
    location,
    headcount,
    contact: '',
    tags: suggestBuddyTags(guide),
    note: buildPrefillNote(guide),
  };

  const summaryLines = [
    location ? `${location}出发` : '出发地待补充',
    headcount ? `${headcount}人` : '人数待补充',
    guide.accommodationNights > 0
      ? `住${guide.accommodationNights}晚 · ${travelGuideBudgetLabel(guide.budgetTier)}`
      : travelGuideBudgetLabel(guide.budgetTier),
    guide.selfDrive ? '自驾' : undefined,
  ].filter((line): line is string => Boolean(line));

  return { form, summaryLines };
}
