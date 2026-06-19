import type { EventDetailPost } from '@/types/post';
import {
  buildEventDetailPostSearchText,
  fuzzyTextMatches,
} from '@/utils/buddyPostSearch';

export type EventDetailPostRuleFilters = {
  departureCity?: string;
  dateKeyword?: string;
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

export function extractDepartureCityOptions(posts: EventDetailPost[]): string[] {
  const cities = new Set<string>();
  for (const post of posts) {
    const city = postDepartureCity(post);
    if (city) {
      cities.add(city);
    }
  }
  return [...cities].sort((a, b) => a.localeCompare(b, 'zh'));
}

export function filterEventDetailPostsByRules(
  posts: EventDetailPost[],
  filters: EventDetailPostRuleFilters,
): EventDetailPost[] {
  const city = filters.departureCity?.trim() ?? '';
  const dateKeyword = filters.dateKeyword?.trim() ?? '';
  if (!city && !dateKeyword) {
    return posts;
  }

  return posts.filter(
    (post) => matchesDepartureCity(post, city) && matchesDateKeyword(post, dateKeyword),
  );
}
