import type { EventDetailPost } from '@/types/post';
import {
  buildEventDetailPostSearchText,
  fuzzyTextMatches,
} from '@/utils/buddyPostSearch';
import { resolveBuddyPostRecruitDisplay } from './parseBuddyPostRecruitDisplay';

export type EventDetailPostRuleFilters = {
  departureCity?: string;
  dateKeyword?: string;
  recruitingOnly?: boolean;
};

function normalizeCityLabel(value: string): string {
  return value.replace(/市$/u, '').replace(/\s+/g, '').trim().toLowerCase();
}

function postDepartureCity(post: EventDetailPost): string {
  const raw =
    'departureCity' in post && typeof post.departureCity === 'string'
      ? post.departureCity
      : '';
  return raw.trim();
}

function matchesDepartureCity(post: EventDetailPost, selectedCity: string): boolean {
  const needle = normalizeCityLabel(selectedCity);
  if (!needle) return true;

  const departure = normalizeCityLabel(postDepartureCity(post));
  const location = normalizeCityLabel(post.location ?? '');
  if (!departure && !location) return false;

  return departure.includes(needle) || location.includes(needle);
}

function matchesDateKeyword(post: EventDetailPost, dateKeyword: string): boolean {
  const keyword = dateKeyword.trim();
  if (!keyword) return true;

  const haystack = [buildEventDetailPostSearchText(post), post.createdAt ?? ''].join(
    ' ',
  );

  return fuzzyTextMatches(haystack, keyword);
}

function matchesRecruitingOnly(
  post: EventDetailPost,
  recruitingOnly: boolean,
): boolean {
  if (!recruitingOnly) return true;
  return resolveBuddyPostRecruitDisplay(post).recruitStatus === 'open';
}

export function extractDepartureCityOptions(posts: EventDetailPost[]): string[] {
  return rankDepartureCitiesByPostCount(posts);
}

export function rankDepartureCitiesByPostCount(posts: EventDetailPost[]): string[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    const city = postDepartureCity(post);
    if (city) {
      counts.set(city, (counts.get(city) ?? 0) + 1);
    }
  }
  return [...counts.keys()].sort((a, b) => {
    const countDiff = (counts.get(b) ?? 0) - (counts.get(a) ?? 0);
    if (countDiff !== 0) return countDiff;
    return a.localeCompare(b, 'zh');
  });
}

export const EVENT_DETAIL_INLINE_CITY_CHIP_LIMIT = 5;

export function pickInlineDepartureCities(
  rankedCities: string[],
  selectedCity: string,
  maxInline = EVENT_DETAIL_INLINE_CITY_CHIP_LIMIT,
): { inlineCities: string[]; hasOverflow: boolean } {
  if (rankedCities.length <= maxInline) {
    return { inlineCities: rankedCities, hasOverflow: false };
  }

  const trimmedSelected = selectedCity.trim();
  const withoutSelected = trimmedSelected
    ? rankedCities.filter((city) => city !== trimmedSelected)
    : rankedCities;
  const inlineCities = trimmedSelected
    ? [trimmedSelected, ...withoutSelected.slice(0, Math.max(0, maxInline - 1))]
    : rankedCities.slice(0, maxInline);

  return { inlineCities, hasOverflow: true };
}

export function filterEventDetailPostsByRules(
  posts: EventDetailPost[],
  filters: EventDetailPostRuleFilters,
): EventDetailPost[] {
  const city = filters.departureCity?.trim() ?? '';
  const dateKeyword = filters.dateKeyword?.trim() ?? '';
  const recruitingOnly = filters.recruitingOnly === true;
  if (!city && !dateKeyword && !recruitingOnly) {
    return posts;
  }

  return posts.filter(
    (post) =>
      matchesDepartureCity(post, city) &&
      matchesDateKeyword(post, dateKeyword) &&
      matchesRecruitingOnly(post, recruitingOnly),
  );
}
