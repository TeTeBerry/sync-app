import type { EventDetailPost } from '../../../types/post';
import {
  CONTENT_TYPE_LABELS,
  resolveContentTypeKey,
} from '../../../utils/postContentTypeDisplay';

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

/** Substring + token prefix fuzzy match for message-board search. */
export function fuzzyTextMatches(text: string, query: string): boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  const haystack = normalizeSearchText(text);
  if (!haystack) return false;

  if (haystack.includes(normalizedQuery)) return true;

  const tokens = normalizedQuery.split(' ').filter(Boolean);
  return tokens.every(
    (token) =>
      haystack.includes(token) ||
      haystack.split(' ').some((word) => word.startsWith(token)),
  );
}

function contentTypeSearchLabels(types: string[] | undefined): string[] {
  if (!types?.length) return [];
  const labels = new Set<string>();
  for (const raw of types) {
    const key = resolveContentTypeKey(raw);
    const label = CONTENT_TYPE_LABELS[key];
    if (label) labels.add(label);
    labels.add(raw);
  }
  return [...labels];
}

export function buildMessageBoardPostSearchText(post: EventDetailPost): string {
  return [
    post.body,
    post.name,
    post.location,
    ...(post.tags ?? []),
    ...contentTypeSearchLabels(post.contentTypes),
  ]
    .filter((part) => typeof part === 'string' && part.trim())
    .join(' ');
}

export function messageBoardPostMatchesQuery(
  post: EventDetailPost,
  query: string,
): boolean {
  return fuzzyTextMatches(buildMessageBoardPostSearchText(post), query);
}
