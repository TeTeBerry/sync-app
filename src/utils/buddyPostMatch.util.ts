import { mergePostContentTypes, resolveContentTypeKey } from './postContentTypeDisplay';

export type BuddyPostMatchSignals = {
  contentTypeKeys: string[];
  tags: string[];
  location?: string;
};

export type BuddyPostMatchCandidate = BuddyPostMatchSignals & {
  createdAt?: string | Date;
};

const CONTENT_TYPE_TAG_KEYS = new Set([
  'team',
  'accommodation',
  'carpool',
  'ticket',
  'groupbuy',
  'other',
]);

function normalizeTag(value: string): string {
  return value.trim().toLowerCase().replace(/^#/, '');
}

function normalizeCity(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed.toLowerCase() : undefined;
}

/** Tags used for overlap scoring (exclude content-type hashtags). */
export function collectMatchTags(
  tags: string[] | undefined,
  contentTypeKeys: string[],
): string[] {
  const contentLabels = new Set(
    contentTypeKeys.map((key) => normalizeTag(resolveContentTypeKey(key))),
  );
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of tags ?? []) {
    const normalized = normalizeTag(raw);
    if (!normalized) continue;
    const asType = resolveContentTypeKey(normalized);
    if (CONTENT_TYPE_TAG_KEYS.has(asType)) continue;
    if (contentLabels.has(normalized)) continue;
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
  }

  return result;
}

export function extractBuddyPostMatchSignals(input: {
  body?: string;
  tags?: string[];
  contentTypes?: string[];
  location?: string;
}): BuddyPostMatchSignals {
  const contentTypeKeys = mergePostContentTypes(input.contentTypes, {
    body: input.body,
    tags: input.tags,
  });
  return {
    contentTypeKeys,
    tags: collectMatchTags(input.tags, contentTypeKeys),
    location: input.location?.trim() || undefined,
  };
}

export function scoreBuddyPostMatch(
  target: BuddyPostMatchSignals,
  candidate: BuddyPostMatchSignals,
): number {
  let score = 0;

  const targetTypes = new Set(target.contentTypeKeys);
  for (const key of candidate.contentTypeKeys) {
    if (targetTypes.has(key)) score += 10;
  }

  const targetTags = new Set(target.tags.map(normalizeTag));
  for (const tag of candidate.tags) {
    if (targetTags.has(normalizeTag(tag))) score += 3;
  }

  const targetCity = normalizeCity(target.location);
  const candidateCity = normalizeCity(candidate.location);
  if (targetCity && candidateCity && targetCity === candidateCity) {
    score += 2;
  }

  return score;
}

function candidateTimestamp(candidate: BuddyPostMatchCandidate): number {
  if (!candidate.createdAt) return 0;
  const value =
    candidate.createdAt instanceof Date
      ? candidate.createdAt.getTime()
      : Date.parse(String(candidate.createdAt));
  return Number.isFinite(value) ? value : 0;
}

export function pickBestMatchingBuddyPost<T extends BuddyPostMatchCandidate>(
  target: BuddyPostMatchSignals,
  candidates: T[],
): T | null {
  if (!candidates.length) return null;

  let best: T | null = null;
  let bestScore = -1;
  let bestTime = 0;

  for (const candidate of candidates) {
    const score = scoreBuddyPostMatch(target, candidate);
    const time = candidateTimestamp(candidate);
    if (
      score > bestScore ||
      (score === bestScore && time > bestTime) ||
      (score === bestScore && time === bestTime && best == null)
    ) {
      best = candidate;
      bestScore = score;
      bestTime = time;
    }
  }

  return best;
}
