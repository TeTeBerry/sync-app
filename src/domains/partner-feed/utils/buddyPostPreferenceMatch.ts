import {
  BUDDY_BUDGET_OPTIONS,
  BUDDY_DEPARTURE_CITIES,
  BUDDY_GENRE_OPTIONS,
  normalizeBuddyBudgetLevel,
  type BuddyBudgetLevel,
} from '../../../constants/buddyPreferences';
import { resolvePrimaryGenreCategory } from '@/packageEvent/pages/exclusive-itinerary/exclusiveItineraryFilters';
import type { EventDetailPost } from '../../../types/backend';
import {
  buildUserGenreMatchSet,
  type BuddyMatchProfile,
} from '../../../utils/buddyMatchProfile';
import { buildEventDetailPostSearchText } from '../../../utils/buddyPostSearch';

const BUDGET_LEVEL_TEXT_MARKERS: ReadonlyArray<{
  level: BuddyBudgetLevel;
  patterns: RegExp[];
}> = [
  {
    level: 'low',
    patterns: [/经济/, /实惠/, /省钱/, /精打细算/],
  },
  {
    level: 'medium',
    patterns: [/舒适/, /标准/, /性价比/],
  },
  {
    level: 'high',
    patterns: [/豪华/, /高端/, /奢华/, /充裕/, /品质优先/],
  },
];

const BUDGET_PRICE_BAND_MARKERS: ReadonlyArray<{
  level: BuddyBudgetLevel;
  pattern: RegExp;
}> = [
  { level: 'low', pattern: /¥?\s*1[0-5]\d\s*[-–~]\s*¥?\s*3\d\d/ },
  { level: 'medium', pattern: /¥?\s*3\d\d\s*[-–~]\s*¥?\s*6\d\d/ },
  { level: 'high', pattern: /¥?\s*6\d\d\s*\+|¥?\s*[7-9]\d\d/ },
];

function normalizeCityName(value?: string): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  const normalized = trimmed.replace(/(市|省)$/, '');
  for (const city of BUDDY_DEPARTURE_CITIES) {
    if (normalized === city || normalized.includes(city)) {
      return city;
    }
  }
  return normalized.length >= 2 ? normalized : undefined;
}

function extractGenresFromPostText(text: string): string[] {
  const lower = text.toLowerCase();
  const found = new Set<string>();

  for (const genre of BUDDY_GENRE_OPTIONS) {
    if (lower.includes(genre.toLowerCase())) {
      found.add(genre);
    }
  }

  const chineseMarkers: Array<{ pattern: RegExp; label: string }> = [
    { pattern: /电音房子|浩室/, label: 'House' },
    { pattern: /科技舞曲|铁克诺/, label: 'Techno' },
    { pattern: /迷幻/, label: 'Trance' },
    { pattern: /回响贝斯/, label: 'Dubstep' },
    { pattern: /鼓打贝斯|dnb/i, label: 'Drum and Bass' },
    { pattern: /硬派/, label: 'Hardstyle' },
  ];
  for (const { pattern, label } of chineseMarkers) {
    if (pattern.test(text)) {
      found.add(label);
    }
  }

  return [...found];
}

export function extractBudgetLevelFromPostText(
  text: string,
): BuddyBudgetLevel | undefined {
  const trimmed = text.trim();
  if (!trimmed) return undefined;

  for (const { level, patterns } of BUDGET_LEVEL_TEXT_MARKERS) {
    if (patterns.some((pattern) => pattern.test(trimmed))) {
      return level;
    }
  }

  for (const { level, pattern } of BUDGET_PRICE_BAND_MARKERS) {
    if (pattern.test(trimmed)) {
      return level;
    }
  }

  return normalizeBuddyBudgetLevel(trimmed);
}

function scoreBudgetPreferenceMatch(
  userBudget: BuddyBudgetLevel,
  postBudget: BuddyBudgetLevel,
): number {
  if (userBudget === postBudget) return 20;
  const adjacent =
    (userBudget === 'low' && postBudget === 'medium') ||
    (userBudget === 'medium' && postBudget === 'low') ||
    (userBudget === 'medium' && postBudget === 'high') ||
    (userBudget === 'high' && postBudget === 'medium');
  return adjacent ? 10 : 0;
}

/** Secondary ranking signal from the viewer's saved match profile. */
export function scoreEventDetailPostPreferenceMatch(
  post: EventDetailPost,
  profile?: BuddyMatchProfile | null,
): number {
  if (!profile) return 0;

  let score = 0;
  const userCity = normalizeCityName(profile.city);
  const departureCity =
    'departureCity' in post && typeof post.departureCity === 'string'
      ? post.departureCity
      : undefined;
  const postCity = normalizeCityName(departureCity) ?? normalizeCityName(post.location);
  if (userCity && postCity && userCity === postCity) {
    score += 50;
  }

  const postText = buildEventDetailPostSearchText(post);
  const postGenres = extractGenresFromPostText(postText);
  const userGenres = buildUserGenreMatchSet(profile.favorGenres);
  let genreHits = 0;
  for (const genre of postGenres) {
    const lower = genre.toLowerCase();
    if (userGenres.has(lower)) {
      genreHits += 1;
      continue;
    }
    const primary = resolvePrimaryGenreCategory(genre);
    if (primary && userGenres.has(primary.toLowerCase())) {
      genreHits += 1;
    }
  }
  score += Math.min(45, genreHits * 15);

  const userBudget = normalizeBuddyBudgetLevel(profile.budgetLevel);
  const postBudget = extractBudgetLevelFromPostText(postText);
  if (userBudget && postBudget) {
    score += scoreBudgetPreferenceMatch(userBudget, postBudget);
  }

  return score;
}

function postCreatedAtMs(post: EventDetailPost): number {
  const raw = post.createdAt?.trim();
  if (!raw) return 0;
  const time = new Date(raw).getTime();
  return Number.isFinite(time) ? time : 0;
}

export function sortEventDetailPostsByPreference(
  posts: EventDetailPost[],
  profile?: BuddyMatchProfile | null,
): EventDetailPost[] {
  if (!profile) return posts;

  return [...posts].sort((left, right) => {
    const scoreDelta =
      scoreEventDetailPostPreferenceMatch(right, profile) -
      scoreEventDetailPostPreferenceMatch(left, profile);
    if (scoreDelta !== 0) return scoreDelta;

    const leftTime = postCreatedAtMs(left);
    const rightTime = postCreatedAtMs(right);
    if (rightTime !== leftTime) return rightTime - leftTime;
    return right.id.localeCompare(left.id);
  });
}

/** Labels for budget tiers (used in tests / parity checks). */
export const BUDGET_OPTION_LABELS = BUDDY_BUDGET_OPTIONS.map((opt) => opt.label);
