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
  return [post.body, post.location, post.name, ...(post.tags ?? [])]
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

export function eventDetailPostMatchesSearchTerms(
  post: EventDetailPost,
  searchTerms: string[],
): boolean {
  if (!searchTerms.length) return true;
  const haystack = buildEventDetailPostSearchText(post);
  return searchTerms.every((term) => fuzzyTextMatches(haystack, term));
}

export function filterEventDetailPostsByQuery(
  posts: EventDetailPost[],
  query: string,
): EventDetailPost[] {
  const searchTerms = resolveBuddySearchTerms(query);
  if (!searchTerms.length) return posts;
  return posts.filter((post) => eventDetailPostMatchesSearchTerms(post, searchTerms));
}
