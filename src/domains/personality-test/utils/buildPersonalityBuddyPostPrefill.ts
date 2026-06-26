import type { AiBuddyPostFormValues } from '@/types/buddyPost';
import type { PersonalityTestCatalog } from '../personalityTestCatalog';
import { getPersonalityMeta } from '../personalityTestCatalog';
import type { PersonalityEventRecommendation, PersonalityTestResult } from '../types';
import { defaultBuddyPostForm } from '@/utils/buddyPostForm';

export type PersonalityBuddyPostPrefill = {
  form: AiBuddyPostFormValues;
  summaryLines: string[];
  prefillBannerTitle: string;
};

function fallbackDateRange(): Pick<AiBuddyPostFormValues, 'dateStart' | 'dateEnd'> {
  const today = new Date();
  const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return { dateStart: iso, dateEnd: iso };
}

export function buildPersonalityBuddyPostPrefill(
  result: PersonalityTestResult,
  targetEvent: PersonalityEventRecommendation,
  catalog: PersonalityTestCatalog,
): PersonalityBuddyPostPrefill {
  const dateSeed = defaultBuddyPostForm(targetEvent.dateLabel) ?? fallbackDateRange();
  const primary = getPersonalityMeta(catalog, result.score.primaryType);
  const soul = result.recommendations.soulMatch;
  const genreHint = primary.genreTags.slice(0, 3).join(' / ');

  const noteParts = [
    genreHint ? `偏 ${genreHint}` : undefined,
    soul.djName?.trim() ? `本命 ${soul.djName.trim()}` : undefined,
  ].filter((part): part is string => Boolean(part));

  const form: AiBuddyPostFormValues = {
    dateStart: dateSeed.dateStart,
    dateEnd: dateSeed.dateEnd,
    location: '',
    headcount: '2',
    tags: ['team'],
    recruitUnityTags: [],
    note: noteParts.length ? noteParts.join(' · ') : undefined,
  };

  const summaryLines = [
    targetEvent.name?.trim(),
    targetEvent.dateLabel?.trim(),
    targetEvent.location?.trim(),
    noteParts.length ? noteParts.join(' · ') : undefined,
  ].filter((line): line is string => Boolean(line));

  return {
    form,
    summaryLines,
    prefillBannerTitle: '人格测试 · 组队预填',
  };
}
