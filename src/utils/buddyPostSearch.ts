import type { EventDetailPost } from '../types/backend';

const SEARCH_STOP_WORDS = new Set([
  '找',
  '个',
  '人',
  '名',
  '需要',
  '希望',
  '想要',
  '搭子',
  '搭伴',
  '比如',
  '检索',
  '喜欢',
]);

function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[#＃]/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isCharacterSubsequence(haystack: string, needle: string): boolean {
  if (!needle) return true;
  let start = 0;
  for (const char of needle) {
    const index = haystack.indexOf(char, start);
    if (index < 0) return false;
    start = index + 1;
  }
  return true;
}

function tokenMatchesHaystack(haystack: string, token: string): boolean {
  if (!token) return true;
  if (haystack.includes(token)) return true;
  if (haystack.split(' ').some((word) => word.startsWith(token))) return true;
  if (token.length >= 2 && isCharacterSubsequence(haystack, token)) return true;
  return false;
}

/** Substring, token prefix, and ordered-character fuzzy match. */
export function fuzzyTextMatches(text: string, query: string): boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  const haystack = normalizeSearchText(text);
  if (!haystack) return false;

  if (haystack.includes(normalizedQuery)) return true;

  const tokens = normalizedQuery.split(' ').filter(Boolean);
  return tokens.every((token) => tokenMatchesHaystack(haystack, token));
}

export function buildEventDetailPostSearchText(post: EventDetailPost): string {
  const departureCity =
    'departureCity' in post && typeof post.departureCity === 'string'
      ? post.departureCity
      : '';
  return [post.body, post.location, departureCity, post.createdAt, ...(post.tags ?? [])]
    .filter((part) => typeof part === 'string' && part.trim())
    .join(' ');
}

export function tokenizeBuddySearchQuery(query: string): string[] {
  const normalized = query
    .replace(/[，,。.!！?？；;、]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!normalized) return [];

  return [
    ...new Set(
      normalized
        .split(' ')
        .map((part) => part.trim().replace(/的搭子$|的搭伴$/, ''))
        .filter((part) => part.length >= 1 && !SEARCH_STOP_WORDS.has(part)),
    ),
  ];
}

export function resolveBuddySearchTerms(query: string): string[] {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const tokens = tokenizeBuddySearchQuery(trimmed);
  return tokens.length ? tokens : [trimmed];
}

const BUDGET_SEARCH_TERM_PATTERN =
  /^(经济|舒适|豪华|标准|实惠|省钱|高端|奢华)(档|型|预算)?/;

function isBudgetBuddySearchTerm(term: string): boolean {
  const trimmed = term.trim();
  if (!trimmed) return false;
  if (BUDGET_SEARCH_TERM_PATTERN.test(trimmed)) return true;
  if (/¥\s*\d/.test(trimmed)) return true;
  if (/\(\s*¥?\d+[-–~]¥?\d+/.test(trimmed)) return true;
  if (/\/晚/.test(trimmed) && /\d/.test(trimmed)) return true;
  return false;
}

function partitionBuddySearchTerms(terms: string[]): {
  required: string[];
  soft: string[];
} {
  const required: string[] = [];
  const soft: string[] = [];
  for (const term of terms) {
    if (isBudgetBuddySearchTerm(term)) {
      soft.push(term);
    } else {
      required.push(term);
    }
  }
  return { required, soft };
}

function budgetLabelFromSearchTerm(term: string): string | undefined {
  const match = term.trim().match(BUDGET_SEARCH_TERM_PATTERN);
  return match?.[1];
}

function searchTermMatchesHaystack(haystack: string, term: string): boolean {
  if (fuzzyTextMatches(haystack, term)) return true;
  const budgetLabel = budgetLabelFromSearchTerm(term);
  if (budgetLabel && fuzzyTextMatches(haystack, budgetLabel)) return true;
  return false;
}

function countMatchedSearchTerms(post: EventDetailPost, terms: string[]): number {
  if (!terms.length) return 0;
  const haystack = buildEventDetailPostSearchText(post);
  return terms.filter((term) => searchTermMatchesHaystack(haystack, term)).length;
}

export function eventDetailPostMatchesSearchTerms(
  post: EventDetailPost,
  searchTerms: string[],
): boolean {
  if (!searchTerms.length) return true;

  const { required, soft } = partitionBuddySearchTerms(searchTerms);
  if (!required.length && !soft.length) return true;

  const requiredMatched = countMatchedSearchTerms(post, required);
  const softMatched = countMatchedSearchTerms(post, soft);

  if (required.length > 0 && requiredMatched === required.length) {
    return true;
  }

  const totalDimensions = required.length + soft.length;
  const matchedDimensions = requiredMatched + softMatched;
  const minMatches = Math.max(1, Math.ceil(totalDimensions * 0.75));

  return matchedDimensions >= minMatches;
}

export function filterEventDetailPostsByQuery(
  posts: EventDetailPost[],
  query: string,
): EventDetailPost[] {
  const searchTerms = resolveBuddySearchTerms(query);
  if (!searchTerms.length) return posts;
  return posts.filter((post) => eventDetailPostMatchesSearchTerms(post, searchTerms));
}
