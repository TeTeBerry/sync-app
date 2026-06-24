import type { AiBuddyPostFormValues } from '@/types/buddyPost';
import type { SetVotePick } from '@/types/activity';
import { defaultBuddyPostForm } from '@/utils/buddyPostForm';
import type { BuddyPostSheetPrefill } from '@/utils/travelGuideToBuddyPost';

function fallbackDateRange(): Pick<AiBuddyPostFormValues, 'dateStart' | 'dateEnd'> {
  const today = new Date();
  const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return { dateStart: iso, dateEnd: iso };
}

export function buildSetVoteBuddyPostPrefill(
  picks: SetVotePick[],
  activityName: string,
  activityDate?: string,
): BuddyPostSheetPrefill {
  const dateSeed = defaultBuddyPostForm(activityDate) ?? fallbackDateRange();
  const pickNames = picks.map((pick) => pick.artistName).filter(Boolean);
  const note = pickNames.length ? `必看 Set：${pickNames.join(' · ')}` : undefined;

  const form: AiBuddyPostFormValues = {
    dateStart: dateSeed.dateStart,
    dateEnd: dateSeed.dateEnd,
    location: '',
    headcount: '2',
    tags: ['team'],
    note,
  };

  const summaryLines = [activityName?.trim(), note].filter((line): line is string =>
    Boolean(line),
  );

  return {
    form,
    summaryLines,
    prefillBannerTitle: '必看 Set · 组队预填',
  };
}
